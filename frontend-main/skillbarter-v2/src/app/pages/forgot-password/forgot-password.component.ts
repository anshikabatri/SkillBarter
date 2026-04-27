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
