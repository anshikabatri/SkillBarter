import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="matches-page">
      <div class="tabs">
        <button [class.active]="tab==='find'" (click)="tab='find'">Find New Matches</button>
        <button [class.active]="tab==='my'" (click)="tab='my';loadMyMatches()">My Matches</button>
      </div>

      <ng-container *ngIf="tab==='find'">
        <div class="filters">
          <input type="text" [(ngModel)]="searchQuery" class="input search-input" placeholder="Search users by name..." (keyup.enter)="searchUsers()">
          <button class="btn-primary" (click)="searchUsers()">Search</button>
        </div>
        <div class="loading" *ngIf="loading">Searching...</div>
        <div class="empty" *ngIf="!loading&&searchResults.length===0&&searched">No users found.</div>
        <div class="grid" *ngIf="searchResults.length>0">
          <div class="ucard" *ngFor="let u of searchResults">
            <div class="uav" [style.background]="gc(u.name)">{{ u.name?.charAt(0) }}</div>
            <h3>{{ u.name }}</h3>
            <p class="uemail">{{ u.email }}</p>
            <p class="ubio" *ngIf="u.bio">{{ u.bio }}</p>
            <button class="btn-primary btn-sm" (click)="createMatch(u)">Connect</button>
          </div>
        </div>
        <div class="hint" *ngIf="!searched">
          <p>Search for users to find skill matches.</p>
          <button class="btn-primary" (click)="loadAllUsers()">Browse All Users</button>
        </div>
      </ng-container>

      <ng-container *ngIf="tab==='my'">
        <div class="loading" *ngIf="loading">Loading matches...</div>
        <div class="empty" *ngIf="!loading&&myMatches.length===0">No matches yet. Find people to connect with!</div>
        <div class="grid" *ngIf="myMatches.length>0">
          <div class="mcard" *ngFor="let m of myMatches">
            <div class="mav" [style.background]="gc(m.user2?.name||m.user1?.name)">{{ (m.user2?.name||m.user1?.name||'?').charAt(0) }}</div>
            <h3>{{ m.user2?.name || m.user1?.name }}</h3>
            <div class="mscore" *ngIf="m.matchScore">{{ m.matchScore | number:'1.0-0' }}% match</div>
            <div class="mdate">Connected {{ m.createdAt | date:'MMM d, y' }}</div>
            <a routerLink="/app/chat" class="btn-primary btn-sm">Message</a>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .matches-page { max-width:1000px; }
    .tabs { display:flex; gap:8px; margin-bottom:24px; }
    .tabs button { padding:9px 20px; border-radius:10px; border:1px solid var(--border2); background:transparent; color:var(--text2); font-size:14px; font-weight:500; cursor:pointer; transition:all 0.2s; }
    .tabs button.active { background:var(--blue); color:white; border-color:var(--blue); }
    .filters { display:flex; gap:12px; margin-bottom:24px; }
    .search-input { flex:1; }
    .loading,.empty,.hint { color:var(--text2); font-size:14px; padding:20px 0; text-align:center; }
    .hint { display:flex; flex-direction:column; align-items:center; gap:16px; padding:40px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; }
    .ucard,.mcard { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px; display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center; }
    .uav,.mav { width:52px; height:52px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700; color:white; font-family:'Syne',sans-serif; }
    .ucard h3,.mcard h3 { font-size:16px; font-weight:700; }
    .uemail,.ubio,.mdate { font-size:12px; color:var(--text2); }
    .mscore { font-size:18px; font-weight:800; color:var(--blue); font-family:'Syne',sans-serif; }
    .btn-sm { padding:7px 18px; font-size:13px; margin-top:4px; }
  `]
})
export class MatchesComponent implements OnInit {
  tab = 'find';
  searchQuery = ''; searchResults: any[] = []; myMatches: any[] = [];
  loading = false; searched = false;
  colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  gc(n: string) { return this.colors[(n?.charCodeAt(0)||0) % this.colors.length]; }

  constructor(private auth: AuthService, private api: ApiService) {}
  ngOnInit() { this.loadAllUsers(); }

  loadAllUsers() {
    this.loading = true;
    this.api.getAllUsers().subscribe({
      next: d => { this.searchResults = (d||[]).filter((u: any) => u.userId !== this.auth.currentUser?.userId); this.loading = false; this.searched = true; },
      error: () => this.loading = false
    });
  }

  searchUsers() {
    if (!this.searchQuery.trim()) { this.loadAllUsers(); return; }
    this.loading = true; this.searched = true;
    this.api.searchUsers(this.searchQuery).subscribe({
      next: d => { this.searchResults = d||[]; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadMyMatches() {
    const u = this.auth.currentUser;
    if (!u?.userId) return;
    this.loading = true;
    this.api.getMatchesByUser(u.userId).subscribe({
      next: d => { this.myMatches = d||[]; this.loading = false; },
      error: () => this.loading = false
    });
  }

  createMatch(user: any) {
    const me = this.auth.currentUser;
    if (!me?.userId) return;
    this.api.createMatch({ user1: { userId: me.userId }, user2: { userId: user.userId }, matchScore: 85 }).subscribe({
      next: () => { alert(`Connected with ${user.name}!`); this.tab = 'my'; this.loadMyMatches(); },
      error: () => alert('Already connected or error occurred.')
    });
  }
}
