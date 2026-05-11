import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  name = ''; email = ''; password = ''; confirmPassword = '';
  languages: string[] = [];
  teachSkillIds: Array<number | string> = [];
  learnSkillIds: Array<number | string> = [];
  availableSkills: any[] = [];
  skillsLoading = false;
  langs = ['English','Hindi','Tamil','Telugu','Kannada','Spanish','French','German','Arabic','Chinese','Japanese'];
  loading = false; error = '';
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  private readonly nameRegex = /^[A-Za-z][A-Za-z\s.'-]{1,79}$/;
  constructor(private auth: AuthService, private api: ApiService, private router: Router) {
    this.loadSkills();
  }

  private loadSkills() {
    this.skillsLoading = true;
    this.api.getAllSkills().subscribe({
      next: (skills) => {
        this.availableSkills = (skills || []).sort((a: any, b: any) => String(a?.name || '').localeCompare(String(b?.name || '')));
        this.skillsLoading = false;
      },
      error: () => {
        this.skillsLoading = false;
      }
    });
  }

  private toIntArray(values: Array<number | string>): number[] {
    return (values || []).map(v => Number(v)).filter(v => Number.isFinite(v));
  }

  private buildUserSkillPayloads(userId: number): any[] {
    const teachIds = this.toIntArray(this.teachSkillIds);
    const learnIds = this.toIntArray(this.learnSkillIds);
    const allIds = Array.from(new Set<number>([...teachIds, ...learnIds]));

    return allIds.map(skillId => ({
      userId,
      skill: { skillId },
      isTeach: teachIds.includes(skillId),
      isLearn: learnIds.includes(skillId)
    }));
  }

  signup() {
    const name = (this.name || '').trim();
    const email = (this.email || '').trim().toLowerCase();
    const password = this.password || '';
    const confirmPassword = this.confirmPassword || '';

    if (!name || !email || !password || !confirmPassword) { this.error = 'Please fill all fields.'; return; }
    if (!this.nameRegex.test(name)) { this.error = 'Please enter a valid full name.'; return; }
    if (!this.emailRegex.test(email)) { this.error = 'Please enter a valid email address.'; return; }
    if (password.length < 6 || password.length > 128) { this.error = 'Password must be 6 to 128 characters.'; return; }
    if (password !== confirmPassword) { this.error = 'Passwords do not match.'; return; }

    this.name = name;
    this.email = email;
    this.loading = true; this.error = '';
    this.auth.register(name, email, password).subscribe({
      next: () => {
        this.auth.login(email, password).subscribe({
          next: () => {
            this.auth.resolveAndStoreCurrentUser().subscribe({
              next: (user) => {
                const languagesSpoken = this.languages.filter(x => !!x?.trim()).join(',');
                this.api.updateUser(user.userId, {
                  name: user.name,
                  bio: user.bio || '',
                  languagesSpoken,
                  email: user.email
                }).subscribe({
                  next: (updated) => {
                    const payloads = this.buildUserSkillPayloads(user.userId);
                    const addCalls = payloads.length ? payloads.map(p => this.api.addUserSkill(p)) : [of(null)];
                    forkJoin(addCalls).subscribe({
                      next: () => {
                        this.auth.setUser(updated);
                        this.loading = false;
                        this.router.navigate(['/profile-setup']);
                      },
                      error: () => {
                        this.auth.setUser(updated);
                        this.loading = false;
                        this.router.navigate(['/profile-setup']);
                      }
                    });
                  },
                  error: () => { this.loading = false; this.router.navigate(['/profile-setup']); }
                });
              },
              error: () => { this.loading = false; this.router.navigate(['/profile-setup']); }
            });
          },
          error: () => { this.loading = false; this.router.navigate(['/login']); }
        });
      },
      error: (e) => { this.error = e?.error?.message || 'Registration failed. Email may exist.'; this.loading = false; }
    });
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.languages = [];
    this.teachSkillIds = [];
    this.learnSkillIds = [];
    this.error = '';
  }

  cancelForm() {
    this.resetForm();
    this.router.navigate(['/login']);
  }
}
