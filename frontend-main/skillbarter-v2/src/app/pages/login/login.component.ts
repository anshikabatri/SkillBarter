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
