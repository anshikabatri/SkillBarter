import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TopbarComponent } from '../topbar/topbar.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Subscription, forkJoin, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TopbarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  hasUnreadChat = false;
  private chatPollSub?: Subscription;
  private openedSessionIds = new Set<number>();
  private lastReadTimestamps = new Map<number, string>();

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit(): void {
    this.loadOpenedSessionState();
    const user = this.auth.currentUser;
    if (user?.userId) {
      this.checkUnreadForUser(user.userId);
      this.chatPollSub = interval(5000).subscribe(() => this.checkUnreadForUser(user.userId));
    } else if (this.auth.isLoggedIn) {
      this.auth.resolveAndStoreCurrentUser().subscribe({
        next: resolved => {
          if (resolved?.userId) {
            this.checkUnreadForUser(resolved.userId);
            this.chatPollSub = interval(5000).subscribe(() => this.checkUnreadForUser(resolved.userId));
          }
        },
        error: () => {}
      });
    }
  }

  ngOnDestroy(): void {
    this.chatPollSub?.unsubscribe();
  }

  private checkUnreadForUser(userId: number) {
    this.loadOpenedSessionState();

    forkJoin({
      learner: this.api.getSessionsByLearner(userId),
      mentor: this.api.getSessionsByMentor(userId)
    }).subscribe({
      next: ({ learner, mentor }) => {
        const sessions = [...(learner || []), ...(mentor || [])]
          .filter((session, index, arr) => arr.findIndex(x => x.sessionId === session.sessionId) === index);

        if (!sessions.length) { this.hasUnreadChat = false; return; }

        forkJoin(
          sessions.map(session =>
            this.api.getMessagesBySession(session.sessionId).pipe(
              map((res: any) => {
                const msgs = res?.data || res || [];
                const lastMsg = msgs.length ? msgs[msgs.length - 1] : null;
                return {
                  sessionId: session.sessionId,
                  lastSenderId: lastMsg?.sender?.userId || null,
                  lastMessageAt: lastMsg?.sentAt || null,
                  hasMessages: msgs.length > 0
                };
              })
            )
          )
        ).subscribe({
          next: (results: any[]) => {
            this.hasUnreadChat = results.some(item => {
              if (!item.hasMessages) return false;
              if (Number(item.lastSenderId) === Number(userId)) return false;
              if (!item.lastMessageAt) return false;

              if (this.openedSessionIds.has(Number(item.sessionId))) {
                const lastRead = this.lastReadTimestamps.get(Number(item.sessionId));
                if (!lastRead) return false;
                return new Date(lastRead) < new Date(item.lastMessageAt);
              }

              return true;
            });
          },
          error: () => { this.hasUnreadChat = false; }
        });
      },
      error: () => { this.hasUnreadChat = false; }
    });
  }

  private loadOpenedSessionState() {
    try {
      const raw = localStorage.getItem('chatOpenedSessions') || '[]';
      const ids = JSON.parse(raw) as number[];
      this.openedSessionIds = new Set((ids || []).map(id => Number(id)));

      const tsRaw = localStorage.getItem('chatReadTimestamps') || '{}';
      const tsMap = JSON.parse(tsRaw) as Record<string, string>;
      this.lastReadTimestamps = new Map(Object.entries(tsMap).map(([k, v]) => [Number(k), v]));
    } catch {
      this.openedSessionIds = new Set<number>();
      this.lastReadTimestamps = new Map();
    }
  }
}