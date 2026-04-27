import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  sessions: any[] = [];
  selected: any = null;
  messages: any[] = [];
  newMsg = '';
  search = '';
  loadingSessions = true;
  loadingMsgs = false;
  me: any;
  pollSub?: Subscription;
  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;
  private openedSessionIds = new Set<number>();
  colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];

  gc(n: string = '') { return this.colors[(n?.charCodeAt(0)||0) % this.colors.length]; }

  get hasUnreadSessions(): boolean {
    return this.sessions.some(session => this.isUnread(session));
  }

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.loadOpenedSessionState();
    this.me = this.auth.currentUser;
    if (this.me?.userId) {
      this.loadSessions();
      this.startPolling();
      return;
    }
    if (this.auth.isLoggedIn) {
      this.auth.resolveAndStoreCurrentUser().subscribe({
        next: (u) => {
          this.me = u;
          this.loadSessions();
          this.startPolling();
        },
        error: () => { this.loadingSessions = false; }
      });
      return;
    }
    this.loadingSessions = false;
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  startPolling() {
    this.pollSub?.unsubscribe();
    this.pollSub = interval(2500).subscribe(() => {
      if (this.me?.userId) this.refreshSessionsSilently();
      if (this.selected?.sessionId) this.refreshMessagesSilently(this.selected.sessionId);
    });
  }

  loadSessions() {
    const id = this.me?.userId;
    if (!id) {
      this.loadingSessions = false;
      return;
    }
    this.loadingSessions = true;
    this.fetchSessionsWithPreviews(id);
  }

  refreshSessionsSilently() {
    const id = this.me?.userId;
    if (!id) return;
    this.fetchSessionsWithPreviews(id);
  }

  private fetchSessionsWithPreviews(userId: number) {
    forkJoin({ learner: this.api.getSessionsByLearner(userId), mentor: this.api.getSessionsByMentor(userId) }).subscribe({
      next: ({ learner, mentor }) => {
        const all = [...(learner || []), ...(mentor || [])]
          .filter((session, index, arr) => arr.findIndex(x => x.sessionId === session.sessionId) === index);

        if (!all.length) {
          this.sessions = [];
          this.loadingSessions = false;
          return;
        }

        forkJoin(
          all.map(session =>
            this.api.getMessagesBySession(session.sessionId).pipe(
              map((res: any) => ({ session, messages: (res?.data || res || []).map((m: any) => ({ ...m, sender: m?.sender || {} })) }))
            )
          )
        ).subscribe({
          next: (results: any[]) => {
            this.sessions = results
              .map(({ session, messages }) => {
                const lastMessage = messages?.length ? messages[messages.length - 1] : null;
                return {
                  ...session,
                  lastMessagePreview: lastMessage?.content || '',
                  lastMessageSenderId: lastMessage?.sender?.userId || null,
                };
              })
              .sort((a: any, b: any) => new Date(b?.scheduledAt || 0).getTime() - new Date(a?.scheduledAt || 0).getTime());
            this.loadingSessions = false;
          },
          error: () => {
            this.sessions = all;
            this.loadingSessions = false;
          }
        });
      },
      error: () => {
        this.loadingSessions = false;
      }
    });
  }

  get filtered() {
    if (!this.search) return this.sessions;
    return this.sessions.filter(s => this.getOther(s)?.toLowerCase().includes(this.search.toLowerCase()));
  }

  getOther(s: any): string {
    if (!s) return 'Unknown';
    if (s.mentor?.userId === this.me?.userId) return s.learner?.name || 'Learner';
    return s.mentor?.name || 'Mentor';
  }

  isUnread(s: any): boolean {
    if (!s?.sessionId) return false;
    if (this.selected?.sessionId === s.sessionId) return false;
    return !this.openedSessionIds.has(Number(s.sessionId)) && !!s.lastMessagePreview;
  }

  selectSession(s: any) {
    this.selected = s;
    this.messages = [];
    this.loadingMsgs = true;
    this.markSessionOpened(s?.sessionId);
    this.api.getMessagesBySession(s.sessionId).subscribe({
      next: (res: any) => {
        this.messages = (res?.data || res || []).map((m: any) => ({ ...m, sender: m?.sender || {} }));
        this.loadingMsgs = false;
        this.scrollToLatestMessage();
      },
      error: () => this.loadingMsgs = false
    });
  }

  refreshMessagesSilently(sessionId: number) {
    this.api.getMessagesBySession(sessionId).subscribe({
      next: (res: any) => {
        const incoming = (res?.data || res || []).map((m: any) => ({ ...m, sender: m?.sender || {} }));
        const currentLen = this.messages.length;
        this.messages = incoming;
        if (incoming.length > currentLen) {
          this.scrollToLatestMessage();
        }
      },
      error: () => {}
    });
  }

  send() {
    if (!this.newMsg.trim() || !this.selected) return;
    const content = this.newMsg;
    this.newMsg = '';
    this.api.sendMessage(this.selected.sessionId, this.me.userId, content).subscribe({
      next: (res: any) => {
        this.messages.push(res?.data || { content, sender: this.me, sentAt: new Date() });
        this.refreshMessagesSilently(this.selected.sessionId);
        this.markSessionOpened(this.selected.sessionId);
        this.scrollToLatestMessage();
      },
      error: () => {
        this.messages.push({ content, sender: this.me, sentAt: new Date() });
      }
    });
  }

  private scrollToLatestMessage() {
    setTimeout(() => {
      const container = this.messagesContainer?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
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

  private saveOpenedSessionState() {
    localStorage.setItem('chatOpenedSessions', JSON.stringify(Array.from(this.openedSessionIds)));
  }

  private markSessionOpened(sessionId: number) {
    if (!sessionId) return;
    this.openedSessionIds.add(Number(sessionId));
    this.saveOpenedSessionState();
  }
}
