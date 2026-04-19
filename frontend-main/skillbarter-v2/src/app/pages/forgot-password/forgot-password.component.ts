import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="glow"></div>
      <div class="auth-card">
        <div class="brand">SkillBarter</div>
        <h1>Reset your password</h1>
        <p class="sub">Generate a reset token and set a new password.</p>

        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" class="input" placeholder="you@domain.com">
        </div>

        <button class="btn-primary w100" (click)="generateToken()" [disabled]="loadingToken">
          {{ loadingToken ? 'Generating...' : 'Generate Reset Token' }}
        </button>

        <div class="form-group" style="margin-top:12px;">
          <label>Reset Token</label>
          <input type="text" [(ngModel)]="token" class="input" placeholder="Paste token">
        </div>

        <div class="form-group">
          <label>New Password</label>
          <input type="password" [(ngModel)]="newPassword" class="input" placeholder="Minimum 6 characters">
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <input type="password" [(ngModel)]="confirmPassword" class="input" placeholder="Repeat password">
        </div>

        <div class="success-box" *ngIf="success">{{ success }}</div>
        <div class="error-box" *ngIf="error">{{ error }}</div>

        <button class="btn-primary w100" (click)="resetPassword()" [disabled]="loadingReset">
          {{ loadingReset ? 'Resetting...' : 'Reset Password' }}
        </button>

        <p class="switch">Back to <a routerLink="/login">Sign In</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg); position:relative; }
    .glow { position:absolute; width:500px; height:500px; background:radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%); top:50%; left:50%; transform:translate(-50%,-50%); }
    .auth-card { position:relative; z-index:1; background:var(--card); border:1px solid var(--border); border-radius:20px; padding:40px; width:100%; max-width:400px; }
    .brand { font-family:'Syne',sans-serif; font-size:17px; font-weight:800; color:var(--blue); margin-bottom:22px; }
    h1 { font-size:24px; font-weight:800; margin-bottom:6px; }
    .sub { color:var(--text2); font-size:14px; margin-bottom:20px; }
    .form-group { margin-bottom:12px; }
    label { display:block; font-size:13px; color:var(--text2); margin-bottom:6px; font-weight:500; }
    .w100 { width:100%; padding:13px; font-size:15px; margin-top:6px; }
    .switch { text-align:center; color:var(--text2); font-size:14px; margin-top:18px; }
    .switch a { color:var(--blue); font-weight:600; }
    .error-box { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:10px 14px; color:#f87171; font-size:13px; margin-bottom:12px; }
    .success-box { background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:10px 14px; color:#34d399; font-size:13px; margin-bottom:12px; }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  token = '';
  newPassword = '';
  confirmPassword = '';

  loadingToken = false;
  loadingReset = false;
  success = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  generateToken() {
    if (!this.email) {
      this.error = 'Please enter your email.';
      return;
    }
    this.error = '';
    this.success = '';
    this.loadingToken = true;

    this.auth.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.token = res?.resetToken || '';
        this.success = 'Reset token generated. Use it below to set a new password.';
        this.loadingToken = false;
      },
      error: (e) => {
        this.error = e?.error?.message || 'Unable to generate reset token.';
        this.loadingToken = false;
      }
    });
  }

  resetPassword() {
    if (!this.token || !this.newPassword || !this.confirmPassword) {
      this.error = 'Please fill all fields.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.error = '';
    this.success = '';
    this.loadingReset = true;

    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.success = 'Password reset successful. Redirecting to login...';
        this.loadingReset = false;
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (e) => {
        this.error = e?.error?.message || 'Unable to reset password.';
        this.loadingReset = false;
      }
    });
  }
}
