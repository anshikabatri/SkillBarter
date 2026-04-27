import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-setup.component.html',
  styleUrl: './profile-setup.component.css'
})
export class ProfileSetupComponent implements OnInit {
  form: any = { name: '', bio: '' };
  loading = false; error = '';
  user: any;
  constructor(private auth: AuthService, private api: ApiService, private router: Router) {}
  ngOnInit() {
    this.user = this.auth.currentUser;
    if (this.user) {
      this.form.name = this.user.name || '';
      this.form.bio = this.user.bio || '';
    }
  }
  save() {
    if (!this.form.name) { this.error = 'Please enter your name.'; return; }
    if (!this.user?.userId) { this.error = 'Please sign in again.'; return; }
    this.loading = true;
    this.api.updateUser(this.user?.userId, {
      name: this.form.name,
      bio: this.form.bio,
      email: this.user?.email
    }).subscribe({
      next: (u) => { this.loading = false; this.auth.setUser(u); this.router.navigate(['/app/dashboard']); },
      error: () => { this.loading = false; this.router.navigate(['/app/dashboard']); }
    });
  }
}
