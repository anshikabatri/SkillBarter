import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  dns = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  cm = new Date().getMonth(); cy = new Date().getFullYear();
  today = new Date(); days: any[] = [];
  matches: any[] = []; sessions: any[] = []; upcoming: any[] = [];
  loadingMatches = true;
  eventDates = new Set<string>();
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
      next: learnerSessions => {
        const learner = learnerSessions || [];
        this.api.getSessionsByMentor(id).subscribe({
          next: mentorSessions => {
            const mentor = mentorSessions || [];
            const combined = [...learner, ...mentor];
            this.sessions = Array.from(new Map(combined.map((s: any) => [s?.sessionId, s])).values());
            this.upcoming = this.sessions.filter(s => (s.status || '').toLowerCase() === 'scheduled');
            this.eventDates = new Set(
              this.sessions
                .map((s: any) => this.toDateKey(s?.scheduledAt))
                .filter((x: string | null): x is string => !!x)
            );
          },
          error: () => {
            this.sessions = learner;
            this.upcoming = learner.filter(s => (s.status || '').toLowerCase() === 'scheduled');
            this.eventDates = new Set(
              learner
                .map((s: any) => this.toDateKey(s?.scheduledAt))
                .filter((x: string | null): x is string => !!x)
            );
          }
        });
      },
      error: () => {}
    });
  }

  private toDateKey(value: any): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  hasEvt(d: any) {
    if (!d?.c) return false;
    return this.eventDates.has(`${this.cy}-${this.cm}-${d.d}`);
  }
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
