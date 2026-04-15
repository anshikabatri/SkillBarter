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
  template: `
    <div class="setup-page">
      <div class="glow"></div>
      <div class="setup-card">
        <div class="brand">SkillBarter</div>
        <h1>Set Up Your Profile</h1>
        <p class="sub">Help us find the best skill matches for you</p>
        <div class="form-group"><label>Your Name</label><input type="text" [(ngModel)]="form.name" class="input" placeholder="Full name"></div>
        <div class="form-group"><label>About You</label><textarea [(ngModel)]="form.bio" class="input ta" placeholder="Tell others what you're about..."></textarea></div>
        <div class="form-group">
          <label>Skills you want to teach (press Enter to add)</label>
          <div class="tag-wrap">
            <div class="tags"><span class="tag" *ngFor="let s of teachSkills">{{ s }}<button (click)="removeT(s)">×</button></span></div>
            <input class="input ti" [(ngModel)]="ti" placeholder="e.g. Python, Guitar..." (keyup.enter)="addT()">
          </div>
        </div>
        <div class="form-group">
          <label>Skills you want to learn (press Enter to add)</label>
          <div class="tag-wrap">
            <div class="tags"><span class="tag" *ngFor="let s of learnSkills">{{ s }}<button (click)="removeL(s)">×</button></span></div>
            <input class="input ti" [(ngModel)]="li" placeholder="e.g. Web Dev, Spanish..." (keyup.enter)="addL()">
          </div>
        </div>
        <div class="form-group">
          <label>Languages (hold Ctrl to select multiple)</label>
          <select [(ngModel)]="form.languages" class="input" multiple size="4">
            <option *ngFor="let l of langs" [value]="l">{{ l }}</option>
          </select>
        </div>
        <div class="error-box" *ngIf="error">{{ error }}</div>
        <button class="btn-primary w100" (click)="save()" [disabled]="loading">{{ loading ? 'Saving...' : 'Continue to Dashboard →' }}</button>
      </div>
    </div>
  `,
  styles: [`
    .setup-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg); padding:40px 20px; position:relative; }
    .glow { position:absolute; width:500px; height:500px; background:radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%); top:50%; left:50%; transform:translate(-50%,-50%); }
    .setup-card { position:relative; z-index:1; background:var(--card); border:1px solid var(--border); border-radius:20px; padding:40px; width:100%; max-width:460px; }
    .brand { font-family:'Syne',sans-serif; font-size:17px; font-weight:800; color:var(--blue); margin-bottom:20px; }
    h1 { font-size:24px; font-weight:800; margin-bottom:6px; }
    .sub { color:var(--text2); font-size:14px; margin-bottom:24px; }
    .form-group { margin-bottom:16px; }
    label { display:block; font-size:13px; color:var(--text2); margin-bottom:6px; font-weight:500; }
    .ta { min-height:72px; resize:vertical; }
    .tag-wrap { background:var(--bg3); border:1px solid var(--border2); border-radius:10px; padding:8px; }
    .tags { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:6px; }
    .tag { background:var(--blue-glow); border:1px solid var(--border); border-radius:20px; padding:3px 10px; font-size:12px; display:flex; align-items:center; gap:4px; }
    .tag button { background:none; border:none; color:var(--text2); cursor:pointer; font-size:14px; }
    .ti { border:none; background:transparent; padding:4px 8px; color:var(--text); font-size:13px; width:100%; }
    .ti:focus { outline:none; }
    select.input { cursor:pointer; }
    select.input option { background:var(--bg3); }
    .w100 { width:100%; padding:13px; font-size:15px; margin-top:8px; }
    .error-box { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:10px 14px; color:#f87171; font-size:13px; margin-bottom:12px; }
  `]
})
export class ProfileSetupComponent implements OnInit {
  form: any = { name: '', bio: '', languages: [] };
  teachSkills: string[] = []; learnSkills: string[] = [];
  ti = ''; li = ''; loading = false; error = '';
  langs = ['English','Hindi','Tamil','Telugu','Kannada','Spanish','French','German','Arabic','Chinese','Japanese'];
  user: any;
  constructor(private auth: AuthService, private api: ApiService, private router: Router) {}
  ngOnInit() { this.user = this.auth.currentUser; if (this.user) this.form.name = this.user.name || ''; }
  addT() { if (this.ti.trim()) { this.teachSkills.push(this.ti.trim()); this.ti = ''; } }
  addL() { if (this.li.trim()) { this.learnSkills.push(this.li.trim()); this.li = ''; } }
  removeT(s: string) { this.teachSkills = this.teachSkills.filter(x => x !== s); }
  removeL(s: string) { this.learnSkills = this.learnSkills.filter(x => x !== s); }
  save() {
    if (!this.form.name) { this.error = 'Please enter your name.'; return; }
    this.loading = true;
    this.api.updateUser(this.user?.userId, { name: this.form.name, bio: this.form.bio, email: this.user?.email }).subscribe({
      next: (u) => { this.auth.setUser(u); this.router.navigate(['/app/dashboard']); },
      error: () => this.router.navigate(['/app/dashboard'])
    });
  }
}
