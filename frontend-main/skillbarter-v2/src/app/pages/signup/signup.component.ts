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
        <div class="form-group">
          <label>Languages (hold Ctrl to select multiple)</label>
          <select [(ngModel)]="languages" class="input" multiple size="4">
            <option *ngFor="let l of langs" [value]="l">{{ l }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Skills I Have (select from platform skills)</label>
          <select [(ngModel)]="teachSkillIds" class="input" multiple size="5" [disabled]="skillsLoading">
            <option *ngFor="let s of availableSkills" [value]="s.skillId">{{ s.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Skills I Need to Learn (select from platform skills)</label>
          <select [(ngModel)]="learnSkillIds" class="input" multiple size="5" [disabled]="skillsLoading">
            <option *ngFor="let s of availableSkills" [value]="s.skillId">{{ s.name }}</option>
          </select>
        </div>
        <div class="sub" *ngIf="skillsLoading" style="margin-bottom:12px;">Loading skills...</div>
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
