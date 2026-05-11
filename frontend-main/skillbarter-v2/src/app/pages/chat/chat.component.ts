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
    if (!id) { this.loadingSessions = false; return; }
    this.loadingSessions = true;
    this.fetchSessionsWithPreviews(id);
  }

  refreshSessionsSilently() {
    const id = this.me?.userId;
    if (!id) return;
    this.fetchSessionsWithPreviews(id);
  }

  private fetchSessionsWithPreviews(userId: number) {
    forkJoin({
      learner: this.api.getSessionsByLearner(userId),
      mentor: this.api.getSessionsByMentor(userId)
    }).subscribe({
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
              map((res: any) => ({
                session,
                messages: (res?.data || res || []).map((m: any) => ({ ...m, sender: m?.sender || {} }))
              }))
            )
          )
        ).subscribe({
          next: (results: any[]) => {
            const userMap = new Map<number, any>();

            results.forEach(({ session, messages }) => {
              const otherUser = session.mentor?.userId === userId ? session.learner : session.mentor;
              if (!otherUser?.userId) return;

              const otherId = Number(otherUser.userId);
              const lastMessage = messages?.length ? messages[messages.length - 1] : null;

              if (!userMap.has(otherId)) {
                userMap.set(otherId, {
                  ...session,
                  otherUser,
                  lastMessagePreview: lastMessage?.content || '',
                  lastMessageSenderId: lastMessage?.sender?.userId || null,
                  lastMessageAt: lastMessage?.sentAt || null,
                  allSessionIds: [session.sessionId]
                });
              } else {
                const existing = userMap.get(otherId);
                existing.allSessionIds.push(session.sessionId);
                if (lastMessage && (!existing.lastMessagePreview ||
                  new Date(lastMessage.sentAt) > new Date(existing.lastMessageAt || 0))) {
                  existing.lastMessagePreview = lastMessage.content;
                  existing.lastMessageSenderId = lastMessage.sender?.userId;
                  existing.lastMessageAt = lastMessage.sentAt;
                }
              }
            });

            this.sessions = Array.from(userMap.values())
              .sort((a: any, b: any) =>
                new Date(b?.lastMessageAt || b?.scheduledAt || 0).getTime() -
                new Date(a?.lastMessageAt || a?.scheduledAt || 0).getTime()
              );
            this.loadingSessions = false;
          },
          error: () => {
            this.sessions = all;
            this.loadingSessions = false;
          }
        });
      },
      error: () => { this.loadingSessions = false; }
    });
  }

  get filtered() {
    if (!this.search) return this.sessions;
    return this.sessions.filter(s => this.getOther(s)?.toLowerCase().includes(this.search.toLowerCase()));
  }

  getOther(s: any): string {
    if (!s) return 'Unknown';
    if (s.otherUser?.name) return s.otherUser.name;
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

    const sessionIds: number[] = s.allSessionIds || [s.sessionId];

    forkJoin(
      sessionIds.map((id: number) =>
        this.api.getMessagesBySession(id).pipe(
          map((res: any) => (res?.data || res || []).map((m: any) => ({ ...m, sender: m?.sender || {} })) as any[])
        )
      )
    ).pipe(
      map((allMessages: any[]) => (allMessages as any[][]).flat()
        .sort((a: any, b: any) => new Date(a.sentAt || 0).getTime() - new Date(b.sentAt || 0).getTime())
      )
    ).subscribe({
      next: (messages: any[]) => {
        this.messages = messages;
        this.loadingMsgs = false;
        this.scrollToLatestMessage();
      },
      error: () => { this.loadingMsgs = false; }
    });
  }

  refreshMessagesSilently(sessionId: number) {
    this.api.getMessagesBySession(sessionId).subscribe({
      next: (res: any) => {
        const incoming = (res?.data || res || []).map((m: any) => ({ ...m, sender: m?.sender || {} }));
        const currentLen = this.messages.length;
        this.messages = incoming;
        if (incoming.length > currentLen) this.scrollToLatestMessage();
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

  isSameDay(date1: any, date2: any): boolean {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }

  getDateLabel(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (this.isSameDay(d, today)) return 'Today';
    if (this.isSameDay(d, yesterday)) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTime(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  private scrollToLatestMessage() {
    setTimeout(() => {
      const container = this.messagesContainer?.nativeElement;
      if (container) container.scrollTop = container.scrollHeight;
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