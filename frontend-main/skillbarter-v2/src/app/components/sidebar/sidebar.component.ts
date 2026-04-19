import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TopbarComponent } from '../topbar/topbar.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Subscription, forkJoin, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TopbarComponent],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-dot"></span>
          <span class="brand-name">SkillBarter</span>
        </div>
        <nav>
          <a routerLink="/app/dashboard" routerLinkActive="active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <a routerLink="/app/matches" routerLinkActive="active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Matches
          </a>
          <a routerLink="/app/chat" routerLinkActive="active" class="nav-item chat-item">
            <span class="chat-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            <span class="chat-label" [class.chat-unread]="hasUnreadChat">
              Chat
              <span class="chat-badge-dot" *ngIf="hasUnreadChat"></span>
            </span>
          </a>
          <a routerLink="/app/calendar" routerLinkActive="active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Calendar
          </a>
          <a routerLink="/app/progress" routerLinkActive="active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            Progress
          </a>
          <a routerLink="/app/community" routerLinkActive="active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Community
          </a>
        </nav>
      </aside>
      <div class="main">
        <app-topbar></app-topbar>
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout { display:flex; height:100vh; background:var(--bg); }
    .sidebar { width:var(--sidebar); min-width:var(--sidebar); background:var(--bg2); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:20px 0; position:fixed; top:0; left:0; bottom:0; z-index:100; }
    .brand { display:flex; align-items:center; gap:8px; padding:0 20px 28px; }
    .brand-dot { width:8px; height:8px; background:var(--blue); border-radius:50%; box-shadow:0 0 8px var(--blue); }
    .brand-name { font-family:'Syne',sans-serif; font-size:15px; font-weight:800; color:var(--text); }
    nav { display:flex; flex-direction:column; gap:2px; padding:0 10px; }
    .nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; color:var(--text2); font-size:14px; font-weight:500; text-decoration:none; transition:all 0.2s; }
    .nav-item:hover { color:var(--text); background:var(--bg3); }
    .nav-item.active { color:var(--text); background:var(--blue-glow); border:1px solid var(--border); }
    .chat-item { justify-content:flex-start; }
    .chat-icon-wrap { position:relative; display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; flex-shrink:0; }
    .chat-label { display:inline-flex; align-items:center; gap:8px; }
    .chat-badge-dot { width:11px; height:11px; border-radius:50%; background:#22c55e; box-shadow:0 0 0 3px rgba(34,197,94,0.18); flex-shrink:0; }
    .chat-unread { font-weight:700; color:var(--text); }
    .main { flex:1; margin-left:var(--sidebar); display:flex; flex-direction:column; overflow:hidden; }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  hasUnreadChat = false;
  private chatPollSub?: Subscription;
  private openedSessionIds = new Set<number>();

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit(): void {
    this.loadOpenedSessionState();
    this.refreshChatIndicator();
    this.chatPollSub = interval(5000).subscribe(() => this.refreshChatIndicator());
  }

  ngOnDestroy(): void {
    this.chatPollSub?.unsubscribe();
  }

  private refreshChatIndicator() {
    const user = this.auth.currentUser;
    if (!user?.userId && !this.auth.isLoggedIn) {
      this.hasUnreadChat = false;
      return;
    }

    const resolveUser$ = user?.userId ? forkJoin({ learner: this.api.getSessionsByLearner(user.userId), mentor: this.api.getSessionsByMentor(user.userId) }) : this.auth.resolveAndStoreCurrentUser().pipe(
      map(resolved => resolved?.userId ? resolved : null),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((resolved: any) => resolved)
    );

    if (user?.userId) {
      this.checkUnreadForUser(user.userId);
      return;
    }

    this.auth.resolveAndStoreCurrentUser().subscribe({
      next: resolved => this.checkUnreadForUser(resolved.userId),
      error: () => { this.hasUnreadChat = false; }
    });
  }

  private checkUnreadForUser(userId: number) {
    forkJoin({ learner: this.api.getSessionsByLearner(userId), mentor: this.api.getSessionsByMentor(userId) }).subscribe({
      next: ({ learner, mentor }) => {
        const sessions = [...(learner || []), ...(mentor || [])]
          .filter((session, index, arr) => arr.findIndex(x => x.sessionId === session.sessionId) === index);

        if (!sessions.length) {
          this.hasUnreadChat = false;
          return;
        }

        forkJoin(
          sessions.map(session =>
            this.api.getMessagesBySession(session.sessionId).pipe(
              map((res: any) => ({ sessionId: session.sessionId, count: (res?.data || res || []).length }))
            )
          )
        ).subscribe({
          next: (results: any[]) => {
            this.hasUnreadChat = results.some(item => Number(item.count || 0) > 0 && !this.openedSessionIds.has(Number(item.sessionId)));
          },
          error: () => {
            this.hasUnreadChat = false;
          }
        });
      },
      error: () => {
        this.hasUnreadChat = false;
      }
    });
  }

  private loadOpenedSessionState() {
    try {
      const raw = localStorage.getItem('chatOpenedSessions') || '[]';
      const ids = JSON.parse(raw) as number[];
      this.openedSessionIds = new Set((ids || []).map(id => Number(id)));
    } catch {
      this.openedSessionIds = new Set<number>();
    }
  }
}
