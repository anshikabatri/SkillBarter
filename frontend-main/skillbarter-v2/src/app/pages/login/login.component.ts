import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="glow"></div>
      <div class="auth-card">
        <div class="brand">SkillBarter</div>
        <h1>Welcome back</h1>
        <p class="sub">Sign in to continue exchanging skills</p>
        <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="email" class="input" placeholder="you@domain.com" (keyup.enter)="login()"></div>
        <div class="form-group"><label>Password</label><input type="password" [(ngModel)]="password" class="input" placeholder="Your password" (keyup.enter)="login()"></div>
        <div class="error-box" *ngIf="error">{{ error }}</div>
        <button class="btn-primary w100" (click)="login()" [disabled]="loading">{{ loading ? 'Signing in...' : 'Sign In' }}</button>
        <p class="switch">Don't have an account? <a routerLink="/signup">Sign Up</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg); position:relative; }
    .glow { position:absolute; width:500px; height:500px; background:radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%); top:50%; left:50%; transform:translate(-50%,-50%); }
    .auth-card { position:relative; z-index:1; background:var(--card); border:1px solid var(--border); border-radius:20px; padding:40px; width:100%; max-width:380px; }
    .brand { font-family:'Syne',sans-serif; font-size:17px; font-weight:800; color:var(--blue); margin-bottom:22px; }
    h1 { font-size:26px; font-weight:800; margin-bottom:6px; }
    .sub { color:var(--text2); font-size:14px; margin-bottom:28px; }
    .form-group { margin-bottom:14px; }
    label { display:block; font-size:13px; color:var(--text2); margin-bottom:6px; font-weight:500; }
    .w100 { width:100%; padding:13px; font-size:15px; margin-top:6px; }
    .switch { text-align:center; color:var(--text2); font-size:14px; margin-top:18px; }
    .switch a { color:var(--blue); font-weight:600; }
    .error-box { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:10px 14px; color:#f87171; font-size:13px; margin-bottom:12px; }
  `]
})
export class LoginComponent {
  email = ''; password = ''; loading = false; error = '';
  constructor(private auth: AuthService, private router: Router) {}
  login() {
    if (!this.email || !this.password) { this.error = 'Please fill in all fields.'; return; }
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.auth.resolveAndStoreCurrentUser().subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/app/dashboard']);
          },
          error: () => {
            this.loading = false;
            this.router.navigate(['/app/dashboard']);
          }
        });
      },
      error: (e) => { this.error = e?.error?.message || 'Invalid email or password.'; this.loading = false; }
    });
  }
}
