import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = ''; password = ''; loading = false; error = '';
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  constructor(private auth: AuthService, private router: Router) {}
  login() {
    const email = (this.email || '').trim();
    const password = this.password || '';
    if (!email || !password) { this.error = 'Please fill in all fields.'; return; }
    if (!this.emailRegex.test(email)) { this.error = 'Please enter a valid email address.'; return; }
    if (password.length < 6) { this.error = 'Password must be at least 6 characters.'; return; }
    this.email = email;
    this.loading = true; this.error = '';
    this.auth.login(email, password).subscribe({
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
  clearSession() {
    localStorage.clear();
  }
}
