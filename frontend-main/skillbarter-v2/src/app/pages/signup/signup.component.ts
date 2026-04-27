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
    if (!this.name || !this.email || !this.password) { this.error = 'Please fill all fields.'; return; }
    if (this.password !== this.confirmPassword) { this.error = 'Passwords do not match.'; return; }
    if (this.password.length < 6) { this.error = 'Password must be at least 6 characters.'; return; }
    this.loading = true; this.error = '';
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.auth.login(this.email, this.password).subscribe({
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
}
