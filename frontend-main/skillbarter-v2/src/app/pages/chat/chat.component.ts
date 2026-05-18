import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { WsChatService } from '../../services/ws-chat.service';
import { environment } from '../../../environments/environment';

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
  private sessionRealtimeUnsubs: Array<() => void> = [];
  private lastReadTimestamps = new Map<number, string>();
  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;
  private openedSessionIds = new Set<number>();
  composerError = '';
  private readonly maxMessageLength = 1000;
  private readonly maxFileSizeBytes = 10 * 1024 * 1024;
  private readonly allowedFileExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.doc', '.docx'];
  colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];

  gc(n: string = '') { return this.colors[(n?.charCodeAt(0)||0) % this.colors.length]; }

  get hasUnreadSessions(): boolean {
    return this.sessions.some(session => this.isUnread(session));
  }

  constructor(private auth: AuthService, private api: ApiService, private ws: WsChatService) {}

  ngOnInit() {
    this.loadOpenedSessionState();
    this.me = this.auth.currentUser;
    this.ws.connect();
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
    this.clearRealtimeSubscriptions();
    this.ws.disconnect();
  }

  startPolling() {
    this.pollSub?.unsubscribe();
    // Polling fallback for environments where WebSocket may be blocked.
    this.pollSub = interval(10000).subscribe(() => {
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
    const q = (this.search || '').trim().toLowerCase();
    if (!q) return this.sessions;
    return this.sessions.filter(s => this.getOther(s)?.toLowerCase().includes(q));
  }

  getOther(s: any): string {
    if (!s) return 'Unknown';
    if (s.otherUser?.name) return s.otherUser.name;
    if (s.mentor?.userId === this.me?.userId) return s.learner?.name || 'Learner';
    return s.mentor?.name || 'Mentor';
  }

  isUnread(s: any): boolean {
    if (!s?.sessionId) return false;
    if (this.selected?.otherUser?.userId === s?.otherUser?.userId) return false;
    if (!s.lastMessagePreview) return false;
    if (!s.lastMessageAt) return false;
    if (Number(s.lastMessageSenderId) === Number(this.me?.userId)) return false;

    // Check if we've read up to this message timestamp
    const allIds: number[] = s.allSessionIds || [s.sessionId];
    const anyRead = allIds.some((id: number) => {
      const lastRead = this.lastReadTimestamps.get(Number(id));
      if (!lastRead) return false;
      return new Date(lastRead) >= new Date(s.lastMessageAt);
    });

    return !anyRead;
  }

  selectSession(s: any) {
    this.selected = s;
    this.messages = [];
    this.loadingMsgs = true;
    this.markSessionOpened(s?.sessionId);
    this.bindRealtimeForSelectedSession();

    const sessionIds: number[] = s.allSessionIds || [s.sessionId];

    forkJoin(
      sessionIds.map((id: number) =>
        this.api.getMessagesBySession(id).pipe(
          map((res: any) => (res?.data || res || []).map((m: any) => ({
            ...m,
            sender: m?.sender || {},
            fileUrl: m?.fileUrl || null,
            fileType: m?.fileType || null
          })) as any[])
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
        // Mark as read after messages load with current time
        const now = new Date().toISOString();
        sessionIds.forEach((id: number) => {
          this.lastReadTimestamps.set(Number(id), now);
        });
        this.saveOpenedSessionState();
      },
      error: () => { this.loadingMsgs = false; }
    });
  }

  refreshMessagesSilently(sessionId: number) {
    if (!this.selected) return;
    const sessionIds: number[] = this.selected.allSessionIds || [sessionId];

    forkJoin(
      sessionIds.map((id: number) =>
        this.api.getMessagesBySession(id).pipe(
          map((res: any) => (res?.data || res || []).map((m: any) => ({
            ...m,
            sender: m?.sender || {},
            fileUrl: m?.fileUrl || null,
            fileType: m?.fileType || null
          })) as any[])
        )
      )
    ).pipe(
      map((allMessages: any[]) => (allMessages as any[][]).flat()
        .sort((a: any, b: any) => new Date(a.sentAt || 0).getTime() - new Date(b.sentAt || 0).getTime())
      )
    ).subscribe({
      next: (messages: any[]) => {
        const currentLen = this.messages.length;
        this.messages = messages;
        if (messages.length > currentLen) this.scrollToLatestMessage();
        // Always update read timestamp while chat is open
        const now = new Date().toISOString();
        sessionIds.forEach((id: number) => {
          this.openedSessionIds.add(Number(id));
          this.lastReadTimestamps.set(Number(id), now);
        });
        this.saveOpenedSessionState();
      },
      error: () => {}
    });
  }

  send() {
    const content = (this.newMsg || '').trim();
    if (!content || !this.selected) return;
    if (content.length > this.maxMessageLength) {
      this.composerError = `Message cannot exceed ${this.maxMessageLength} characters.`;
      return;
    }
    this.composerError = '';
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file || !this.selected) return;

    const lowerName = (file.name || '').toLowerCase();
    const hasValidExtension = this.allowedFileExtensions.some(ext => lowerName.endsWith(ext));
    if (!hasValidExtension) {
      this.composerError = 'Unsupported file type. Allowed: images, PDF, DOC, DOCX.';
      input.value = '';
      return;
    }
    if (file.size > this.maxFileSizeBytes) {
      this.composerError = 'File size must be 10MB or less.';
      input.value = '';
      return;
    }
    this.composerError = '';

    this.api.sendFile(this.selected.sessionId, this.me.userId, file).subscribe({
      next: (res: any) => {
        const msg = res?.data || res;
        this.messages.push({ ...msg, sender: this.me });
        this.scrollToLatestMessage();
        input.value = '';
      },
      error: () => {}
    });
  }

  getFileUrl(fileUrl: string): string {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    return `${environment.apiUrl.replace('/api', '')}${fileUrl}`;
  }

  openImage(fileUrl: string) {
    window.open(this.getFileUrl(fileUrl), '_blank');
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

      const tsRaw = localStorage.getItem('chatReadTimestamps') || '{}';
      const tsMap = JSON.parse(tsRaw) as Record<string, string>;
      this.lastReadTimestamps = new Map(Object.entries(tsMap).map(([k, v]) => [Number(k), v]));
    } catch {
      this.openedSessionIds = new Set<number>();
      this.lastReadTimestamps = new Map();
    }
  }

  private saveOpenedSessionState() {
    localStorage.setItem('chatOpenedSessions', JSON.stringify(Array.from(this.openedSessionIds)));
    const tsObj: Record<string, string> = {};
    this.lastReadTimestamps.forEach((v, k) => { tsObj[k] = v; });
    localStorage.setItem('chatReadTimestamps', JSON.stringify(tsObj));
  }

  private markSessionOpened(sessionId: number) {
     if (!sessionId) return;
     this.openedSessionIds.add(Number(sessionId));
     const now = new Date().toISOString();
     if (this.selected?.allSessionIds) {
       this.selected.allSessionIds.forEach((id: number) => {
         this.openedSessionIds.add(Number(id));
         this.lastReadTimestamps.set(Number(id), now);
       });
     }
     // Also set for the direct sessionId
     this.lastReadTimestamps.set(Number(sessionId), now);
     this.saveOpenedSessionState();
   }

  private bindRealtimeForSelectedSession() {
    this.clearRealtimeSubscriptions();
    const sessionIds: number[] = this.selected?.allSessionIds || (this.selected?.sessionId ? [this.selected.sessionId] : []);
    sessionIds.forEach((id: number) => {
      const unsubscribe = this.ws.subscribeToSession(Number(id), () => {
        this.refreshSessionsSilently();
        if (this.selected?.sessionId) {
          this.refreshMessagesSilently(this.selected.sessionId);
        }
      });
      this.sessionRealtimeUnsubs.push(unsubscribe);
    });
  }

  private clearRealtimeSubscriptions() {
    this.sessionRealtimeUnsubs.forEach(unsub => unsub());
    this.sessionRealtimeUnsubs = [];
  }
}