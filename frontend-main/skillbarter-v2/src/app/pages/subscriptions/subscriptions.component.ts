import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export class SubscriptionsComponent implements OnInit {
  userId: number | null = null;
  sessions: any[] = [];
  transactions: any[] = [];
  loading = false;
  loadingTxn = false;
  error = '';
  showForm = false;
  submitting = false;
  amountError = '';
  showSuccess = false;
  sentAmount = '';
  confettiItems: string[] = [];

  form = {
    sessionId: null as number | null,
    amount: '',
    paymentMethod: '',
    upiApp: '',
    otherBank: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
    agree: false
  };

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    const u = this.auth.currentUser;
    if (u?.userId) {
      this.userId = u.userId;
      this.loadData();
    } else if (this.auth.isLoggedIn) {
      this.auth.resolveAndStoreCurrentUser().subscribe({
        next: user => { this.userId = user.userId; this.loadData(); },
        error: () => {}
      });
    }
  }

  loadData() {
    if (!this.userId) return;
    this.loading = true;
    this.loadingTxn = true;

    forkJoin({
      learner: this.api.getSessionsByLearner(this.userId),
      mentor: this.api.getSessionsByMentor(this.userId),
      sent: this.api.getTransactionsByUser(this.userId),
      received: this.api.getReceivedTransactions(this.userId)
    }).subscribe({
      next: ({ learner, mentor, sent, received }) => {
        const all = [...(learner || []), ...(mentor || [])]
          .filter((s, i, arr) => arr.findIndex(x => x.sessionId === s.sessionId) === i)
          .filter((s: any) => (s.status || '').toLowerCase() === 'completed')
          .filter((s: any) => Number(s.learner?.userId) === Number(this.userId));
        this.sessions = all;
        this.loading = false;

        const allTxns = [...(sent || []), ...(received || [])]
          .filter((t, i, arr) => arr.findIndex(x => x.transactionId === t.transactionId) === i)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.transactions = allTxns;
        this.loadingTxn = false;
      },
      error: () => { this.loading = false; this.loadingTxn = false; }
    });
  }

  getSessionLabel(s: any): string {
    const skill = s.skill?.name || 'Session';
    const other = s.mentor?.userId === this.userId ? s.learner?.name : s.mentor?.name;
    return `${skill} with ${other}`;
  }

  validateAmount(): boolean {
    const amt = parseFloat(this.form.amount);
    if (!this.form.amount) { this.amountError = 'Amount is required'; return false; }
    if (isNaN(amt)) { this.amountError = 'Amount must be a number'; return false; }
    if (amt < 10) { this.amountError = 'Minimum amount is ₹10'; return false; }
    if (amt > 5000) { this.amountError = 'Maximum amount is ₹5000'; return false; }
    this.amountError = '';
    return true;
  }

  generateConfetti() {
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
    this.confettiItems = Array.from({ length: 40 }, (_, i) => {
      const color = colors[i % colors.length];
      const left = Math.random() * 100;
      const delay = Math.random() * 1.5;
      const duration = 1.5 + Math.random() * 1.5;
      const size = 6 + Math.random() * 8;
      return `left:${left}%;animation-delay:${delay}s;animation-duration:${duration}s;background:${color};width:${size}px;height:${size}px`;
    });
  }

  closeSuccess() {
    this.showSuccess = false;
    this.sentAmount = '';
    this.confettiItems = [];
  }

  submit() {
    this.error = '';
    if (!this.form.sessionId) { this.error = 'Please select a session'; return; }
    if (!this.validateAmount()) return;
    if (!this.form.paymentMethod) { this.error = 'Please select a payment method'; return; }
    if (!this.form.agree) { this.error = 'Please agree to the terms'; return; }

    if (this.form.paymentMethod === 'Card') {
      const cardNum = this.form.cardNumber.replace(/\s/g, '');
      if (!cardNum || cardNum.length !== 16) { this.error = 'Please enter a valid 16-digit card number'; return; }
      if (!this.form.cardExpiry || this.form.cardExpiry.length !== 5) { this.error = 'Please enter a valid expiry date (MM/YY)'; return; }
      if (!this.form.cardCvv || this.form.cardCvv.length !== 3) { this.error = 'Please enter a valid 3-digit CVV'; return; }
      if (!this.form.cardName.trim()) { this.error = 'Please enter the name on card'; return; }
      const [month, year] = this.form.cardExpiry.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < new Date()) { this.error = 'Card has expired'; return; }
    }

    if (this.form.paymentMethod === 'UPI') {
      if (!this.form.upiApp) { this.error = 'Please select a UPI app'; return; }
      if (this.form.upiApp === 'Other') {
        if (!this.form.otherBank.trim()) { this.error = 'Please enter your UPI ID'; return; }
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
        if (!upiRegex.test(this.form.otherBank.trim())) {
          this.error = 'Please enter a valid UPI ID (e.g. name@ybl, name@okaxis)';
          return;
        }
      }
    }

    if (this.form.paymentMethod === 'NetBanking') {
      if (!this.form.upiApp) { this.error = 'Please select a bank'; return; }
      if (this.form.upiApp === 'Other' && !this.form.otherBank.trim()) { this.error = 'Please enter your bank name'; return; }
    }

    this.submitting = true;
    const amount = this.form.amount;
    this.api.createTransaction({
      user: { userId: this.userId },
      session: { sessionId: this.form.sessionId },
      amount: parseFloat(amount),
      paymentMethod: this.form.paymentMethod,
      status: 'Success'
    }).subscribe({
      next: () => {
        this.sentAmount = amount;
        this.submitting = false;
        this.reset();
        this.showForm = false;
        this.loadData();
        setTimeout(() => {
          this.generateConfetti();
          this.showSuccess = true;
        }, 100);
      },
      error: (e: any) => {
        this.error = e?.error?.message || 'Transaction failed. Please try again.';
        this.submitting = false;
      }
    });
  }

  reset() {
    this.form = {
      sessionId: null, amount: '', paymentMethod: '',
      upiApp: '', otherBank: '',
      cardNumber: '', cardExpiry: '', cardCvv: '', cardName: '',
      agree: false
    };
    this.amountError = '';
    this.error = '';
  }

  cancel() {
    this.reset();
    this.showForm = false;
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\D/g, '').substring(0, 16);
    value = value.replace(/(.{4})/g, '$1 ').trim();
    this.form.cardNumber = value;
  }

  formatExpiry(event: any) {
    let value = event.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      let month = parseInt(value.substring(0, 2));
      if (month > 12) month = 12;
      if (month < 1 && value.length >= 2) month = 1;
      value = month.toString().padStart(2, '0') + '/' + value.substring(2);
    }
    this.form.cardExpiry = value;
  }
}