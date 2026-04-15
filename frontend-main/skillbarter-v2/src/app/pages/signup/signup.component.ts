import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="glow"></div>
      <div class="auth-card">
        <div class="brand">SkillBarter</div>
        <h1>Create account</h1>
        <p class="sub">Join thousands exchanging skills globally</p>
        <div class="form-group"><label>Full Name</label><input type="text" [(ngModel)]="name" class="input" placeholder="Your full name"></div>
        <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="email" class="input" placeholder="you@domain.com"></div>
        <div class="form-group"><label>Password</label><input type="password" [(ngModel)]="password" class="input" placeholder="Min 6 characters"></div>
        <div class="form-group"><label>Confirm Password</label><input type="password" [(ngModel)]="confirmPassword" class="input" placeholder="Repeat password"></div>
        <div class="error-box" *ngIf="error">{{ error }}</div>
        <button class="btn-primary w100" (click)="signup()" [disabled]="loading">{{ loading ? 'Creating account...' : 'Create Account' }}</button>
        <p class="switch">Already have an account? <a routerLink="/login">Sign In</a></p>
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
    .form-group { margin-bottom:12px; }
    label { display:block; font-size:13px; color:var(--text2); margin-bottom:6px; font-weight:500; }
    .w100 { width:100%; padding:13px; font-size:15px; margin-top:6px; }
    .switch { text-align:center; color:var(--text2); font-size:14px; margin-top:18px; }
    .switch a { color:var(--blue); font-weight:600; }
    .error-box { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:10px 14px; color:#f87171; font-size:13px; margin-bottom:12px; }
  `]
})
export class SignupComponent {
  name = ''; email = ''; password = ''; confirmPassword = '';
  loading = false; error = '';
  constructor(private auth: AuthService, private router: Router) {}
  signup() {
    if (!this.name || !this.email || !this.password) { this.error = 'Please fill all fields.'; return; }
    if (this.password !== this.confirmPassword) { this.error = 'Passwords do not match.'; return; }
    if (this.password.length < 6) { this.error = 'Password must be at least 6 characters.'; return; }
    this.loading = true; this.error = '';
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: (user) => {
        this.auth.login(this.email, this.password).subscribe({
          next: () => { this.auth.setUser(user); this.router.navigate(['/profile-setup']); },
          error: () => { this.loading = false; this.router.navigate(['/login']); }
        });
      },
      error: (e) => { this.error = e?.error?.message || 'Registration failed. Email may exist.'; this.loading = false; }
    });
  }
}
