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
