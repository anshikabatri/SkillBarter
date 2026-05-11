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
  success = '';
  error = '';
  showForm = false;
  submitting = false;

  form = {
    sessionId: null as number | null,
    amount: '',
    paymentMethod: '',
    upiApp: '',
    agree: false
  };

  amountError = '';
  private readonly validPaymentMethods = new Set(['UPI', 'Card', 'NetBanking']);
  private readonly validUpiApps = new Set(['GPay', 'PhonePe', 'Paytm', 'Other']);

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
    if (!String(this.form.amount || '').trim()) { this.amountError = 'Amount is required'; return false; }
    if (isNaN(amt)) { this.amountError = 'Amount must be a number'; return false; }
    if (amt < 10) { this.amountError = 'Minimum amount is ₹10'; return false; }
    if (amt > 5000) { this.amountError = 'Maximum amount is ₹5000'; return false; }
    this.amountError = '';
    return true;
  }

  submit() {
    this.error = '';
    this.success = '';
    if (!this.form.sessionId) { this.error = 'Please select a session'; return; }
    if (!this.sessions.some(s => Number(s.sessionId) === Number(this.form.sessionId))) {
      this.error = 'Selected session is invalid.';
      return;
    }
    if (!this.validateAmount()) return;
    if (!this.validPaymentMethods.has(this.form.paymentMethod)) { this.error = 'Please select a valid payment method'; return; }
    if (this.form.paymentMethod === 'UPI' && !this.validUpiApps.has(this.form.upiApp)) {
      this.error = 'Please select a UPI app.';
      return;
    }
    if (!this.form.agree) { this.error = 'Please agree to the terms'; return; }

    this.submitting = true;
    this.api.createTransaction({
      user: { userId: this.userId },
      session: { sessionId: this.form.sessionId },
      amount: parseFloat(this.form.amount),
      paymentMethod: this.form.paymentMethod,
      status: 'Success'
    }).subscribe({
      next: () => {
        this.success = `✅ Donation of ₹${this.form.amount} sent successfully!`;
        this.reset();
        this.showForm = false;
        this.loadData();
        this.submitting = false;
      },
      error: (e: any) => {
        this.error = e?.error?.message || 'Transaction failed. Please try again.';
        this.submitting = false;
      }
    });
  }

  reset() {
    this.form = { sessionId: null, amount: '', paymentMethod: '', upiApp: '', agree: false };
    this.amountError = '';
    this.error = '';
  }

  cancel() {
    this.reset();
    this.showForm = false;
  }
}