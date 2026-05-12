import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
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
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  constructor(private auth: AuthService, private router: Router) {}

  generateToken() {
    const email = (this.email || '').trim().toLowerCase();
    if (!email) {
      this.error = 'Please enter your email.';
      return;
    }
    if (!this.emailRegex.test(email)) {
      this.error = 'Please enter a valid email address.';
      return;
    }
    this.email = email;
    this.error = '';
    this.success = '';
    this.loadingToken = true;

    this.auth.forgotPassword(email).subscribe({
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
    const token = (this.token || '').trim();
    const newPassword = this.newPassword || '';
    const confirmPassword = this.confirmPassword || '';

    if (!token || !newPassword || !confirmPassword) {
      this.error = 'Please fill all fields.';
      return;
    }
    if (token.length < 6 || token.length > 256) {
      this.error = 'Please enter a valid reset token.';
      return;
    }
    if (newPassword.length < 6 || newPassword.length > 128) {
      this.error = 'Password must be 6 to 128 characters.';
      return;
    }
    if (newPassword !== confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.token = token;

    this.error = '';
    this.success = '';
    this.loadingReset = true;

    this.auth.resetPassword(token, newPassword).subscribe({
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

  resetForm() {
    this.email = '';
    this.token = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.success = '';
    this.error = '';
  }

  cancelForm() {
    this.resetForm();
    this.router.navigate(['/login']);
  }
}
