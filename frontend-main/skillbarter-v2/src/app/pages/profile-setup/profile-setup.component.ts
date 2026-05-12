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
  private initialForm: any = { name: '', bio: '' };
  loading = false; error = '';
  user: any;
  private readonly nameRegex = /^[A-Za-z][A-Za-z\s.'-]{1,79}$/;
  constructor(private auth: AuthService, private api: ApiService, private router: Router) {}
  ngOnInit() {
    this.user = this.auth.currentUser;
    if (this.user) {
      this.form.name = this.user.name || '';
      this.form.bio = this.user.bio || '';
      this.initialForm = { ...this.form };
    }
  }
  save() {
    const name = String(this.form.name || '').trim();
    const bio = String(this.form.bio || '').trim();
    if (!name) { this.error = 'Please enter your name.'; return; }
    if (!this.nameRegex.test(name)) { this.error = 'Please enter a valid name.'; return; }
    if (bio.length > 500) { this.error = 'Bio cannot exceed 500 characters.'; return; }
    if (!this.user?.userId) { this.error = 'Please sign in again.'; return; }
    this.form.name = name;
    this.form.bio = bio;
    this.loading = true;
    this.error = '';
    this.api.updateUser(this.user?.userId, {
      name,
      bio,
      email: this.user?.email
    }).subscribe({
      next: (u) => { this.loading = false; this.auth.setUser(u); this.router.navigate(['/app/dashboard']); },
      error: () => { this.loading = false; this.router.navigate(['/app/dashboard']); }
    });
  }

  resetForm() {
    this.form = { ...this.initialForm };
    this.error = '';
  }

  cancelForm() {
    this.resetForm();
    this.router.navigate(['/app/dashboard']);
  }
}
