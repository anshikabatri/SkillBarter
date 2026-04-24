import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dash">
      <div class="left">
        <!-- Activity -->
        <div class="card">
          <div class="ch"><h2>Activity</h2><span class="pill">Today</span></div>
          <div class="empty" *ngIf="sessions.length===0">
            <div class="ei">🎯</div>
            <h3>Ready for your first session?</h3>
            <p>Book a session to start tracking activity and earning XP.</p>
            <a routerLink="/app/calendar" class="btn-primary">Schedule a session</a>
          </div>
          <div *ngIf="sessions.length>0">
            <div class="sess-item" *ngFor="let s of sessions">
              <div><div class="sn">{{ s.mentor?.name || s.learner?.name || 'Session' }}</div><div class="st">{{ s.scheduledAt | date:'MMM d, h:mm a' }}</div></div>
              <span class="sbadge" [class]="(s.status||'').toLowerCase()">{{ s.status }}</span>
            </div>
          </div>
          <div class="stats">
            <div class="stat"><span>Sessions completed</span><strong>{{ completedSessions }}</strong></div>
            <div class="stat"><span>Upcoming sessions</span><strong>{{ upcomingCount }}</strong></div>
          </div>
        </div>

        <!-- Matches -->
        <div class="card">
          <div class="ch"><h2>Top Matches</h2><a routerLink="/app/matches" class="link">see all →</a></div>
          <div class="loading" *ngIf="loadingMatches">Loading...</div>
          <div class="empty-sm" *ngIf="!loadingMatches&&matches.length===0">
            No matches yet. <a routerLink="/app/matches" class="link">Find matches</a>
          </div>
          <div class="mrow" *ngIf="matches.length>0">
            <div class="mc" *ngFor="let m of matches.slice(0,3)">
              <div class="mav" [style.background]="gc(m.user2?.name||m.user1?.name)">{{ (m.user2?.name||m.user1?.name||'?').charAt(0) }}</div>
              <div class="mn">{{ m.user2?.name || m.user1?.name }}</div>
              <div class="ms">{{ formatMatchScore(m) }}</div>
              <a routerLink="/app/matches" class="btn-sm">View</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar -->
      <div class="card cal-card">
        <div class="calh">
          <button class="cn" (click)="prev()">‹</button>
          <span class="ct">{{ months[cm] }} {{ cy }}</span>
          <button class="cn" (click)="next()">›</button>
        </div>
        <div class="cg">
          <div class="dn" *ngFor="let d of dns">{{ d }}</div>
          <div *ngFor="let d of days" class="cd" [class.today]="isTd(d)" [class.other]="!d.c" [class.evt]="hasEvt(d)">{{ d.d||'' }}</div>
        </div>
        <div class="upcoming">
          <h4>Upcoming</h4>
          <div class="empty-sm" *ngIf="upcoming.length===0">No upcoming sessions</div>
          <div class="ui" *ngFor="let s of upcoming.slice(0,3)">
            <div class="udot"></div>
            <div><div class="un">{{ s.skill?.name || 'Session' }}</div><div class="ut">{{ s.scheduledAt | date:'MMM d, h:mm a' }}</div></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash { display:flex; gap:20px; align-items:flex-start; }
    .left { flex:1; display:flex; flex-direction:column; gap:20px; }
    .card { background:var(--card); border-radius:16px; border:1px solid var(--border); padding:22px; }
    .ch { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
    .ch h2 { font-size:18px; font-weight:700; }
    .pill { background:var(--bg3); border:1px solid var(--border2); border-radius:20px; padding:4px 12px; font-size:12px; color:var(--text2); }
    .link { color:var(--blue); font-size:13px; text-decoration:none; }
    .empty { text-align:center; padding:20px 0; }
    .ei { font-size:32px; margin-bottom:10px; }
    .empty h3 { font-size:15px; font-weight:600; margin-bottom:6px; }
    .empty p { color:var(--text2); font-size:13px; margin-bottom:16px; }
    .empty a { text-decoration:none; }
    .empty-sm { color:var(--text2); font-size:13px; padding:8px 0; }
    .sess-item { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border2); }
    .sn { font-size:14px; font-weight:500; }
    .st { font-size:12px; color:var(--text2); margin-top:2px; }
    .sbadge { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; }
    .sbadge.scheduled,.sbadge.SCHEDULED { background:rgba(59,130,246,0.15); color:var(--blue); }
    .sbadge.completed,.sbadge.COMPLETED { background:rgba(16,185,129,0.15); color:var(--green); }
    .sbadge.cancelled,.sbadge.CANCELLED { background:rgba(239,68,68,0.15); color:var(--red); }
    .stats { display:flex; gap:20px; border-top:1px solid var(--border2); padding-top:14px; margin-top:14px; }
    .stat { flex:1; }
    .stat span { display:block; font-size:12px; color:var(--text2); margin-bottom:4px; }
    .stat strong { font-size:20px; font-weight:800; font-family:'Syne',sans-serif; }
    .loading { color:var(--text2); font-size:14px; padding:12px 0; }
    .mrow { display:flex; gap:12px; overflow-x:auto; }
    .mc { background:var(--bg3); border-radius:12px; padding:16px 12px; min-width:130px; display:flex; flex-direction:column; align-items:center; gap:6px; border:1px solid var(--border2); }
    .mav { width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; color:white; font-family:'Syne',sans-serif; }
    .mn { font-size:13px; font-weight:600; text-align:center; }
    .ms { font-size:20px; font-weight:800; color:var(--blue); font-family:'Syne',sans-serif; }
    .btn-sm { background:var(--blue); color:white; border:none; border-radius:8px; padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer; text-decoration:none; }
    .cal-card { width:300px; min-width:280px; }
    .calh { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
    .ct { font-size:15px; font-weight:700; font-family:'Syne',sans-serif; }
    .cn { background:none; border:none; color:var(--text2); font-size:18px; cursor:pointer; }
    .cn:hover { color:var(--text); }
    .cg { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; margin-bottom:14px; }
    .dn { text-align:center; font-size:11px; color:var(--text3); padding:4px 0; font-weight:600; }
    .cd { text-align:center; padding:6px 2px; border-radius:8px; font-size:13px; cursor:pointer; transition:background 0.15s; }
    .cd:hover:not(.other) { background:var(--bg3); }
    .cd.today { background:var(--blue); color:white; border-radius:50%; font-weight:700; }
    .cd.other { color:var(--text3); }
    .cd.evt:not(.today) { background:var(--blue-glow); border:1px solid var(--border); }
    .upcoming h4 { font-size:13px; font-weight:600; border-top:1px solid var(--border2); padding-top:12px; margin-bottom:10px; color:var(--text2); text-transform:uppercase; letter-spacing:0.5px; }
    .ui { display:flex; align-items:flex-start; gap:8px; margin-bottom:8px; }
    .udot { width:7px; height:7px; border-radius:50%; background:var(--blue); margin-top:5px; flex-shrink:0; }
    .un { font-size:13px; font-weight:500; }
    .ut { font-size:11px; color:var(--text2); }
  `]
})
export class DashboardComponent implements OnInit {
  dns = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  cm = new Date().getMonth(); cy = new Date().getFullYear();
  today = new Date(); days: any[] = [];
  matches: any[] = []; sessions: any[] = []; upcoming: any[] = [];
  loadingMatches = true;
  eventDates: number[] = [];
  colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  gc(n: string) { return this.colors[(n?.charCodeAt(0)||0) % this.colors.length]; }
  get completedSessions() { return this.sessions.filter(s => (s.status||'').toLowerCase() === 'completed').length; }
  get upcomingCount() { return this.upcoming.length; }

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.buildCal();
    const u = this.auth.currentUser;
    if (u?.userId) { this.loadMatches(u.userId); this.loadSessions(u.userId); }
  }

  loadMatches(id: number) {
    this.loadingMatches = true;
    this.api.getMatchesByUser(id).subscribe({
      next: d => {
        this.matches = (d || []).map((m: any) => ({
          ...m,
          _scoreValue: this.toScoreNumber(m?.matchScore ?? m?.score)
        }));
        this.loadingMatches = false;
      },
      error: () => this.loadingMatches = false
    });
  }

  private toScoreNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  formatMatchScore(match: any): string {
    const raw = match?._scoreValue ?? this.toScoreNumber(match?.matchScore ?? match?.score);
    if (raw === null) return 'N/A';
    return `${Math.round(raw)}%`;
  }

  loadSessions(id: number) {
    this.api.getSessionsByLearner(id).subscribe({
      next: d => {
        this.sessions = d||[];
        this.upcoming = this.sessions.filter(s => (s.status||'').toLowerCase() === 'scheduled');
        this.eventDates = this.sessions.map(s => new Date(s.scheduledAt).getDate());
      }, error: () => {}
    });
    this.api.getSessionsByMentor(id).subscribe({
      next: d => {
        const mentor = d||[];
        this.sessions = [...this.sessions, ...mentor];
        const mUpcoming = mentor.filter(s => (s.status||'').toLowerCase() === 'scheduled');
        this.upcoming = [...this.upcoming, ...mUpcoming];
      }, error: () => {}
    });
  }

  hasEvt(d: any) { return d.c && this.eventDates.includes(d.d); }
  buildCal() {
    const f = new Date(this.cy, this.cm, 1), l = new Date(this.cy, this.cm+1, 0);
    const days: any[] = [];
    for (let i = 0; i < f.getDay(); i++) days.push({d:'',c:false});
    for (let d = 1; d <= l.getDate(); d++) days.push({d,c:true});
    const r = 7-(days.length%7); if(r<7) for(let i=1;i<=r;i++) days.push({d:i,c:false});
    this.days = days;
  }
  isTd(d: any) { return d.c && d.d===this.today.getDate() && this.cm===this.today.getMonth() && this.cy===this.today.getFullYear(); }
  prev() { if(this.cm===0){this.cm=11;this.cy--;}else this.cm--; this.buildCal(); }
  next() { if(this.cm===11){this.cm=0;this.cy++;}else this.cm++; this.buildCal(); }
}
