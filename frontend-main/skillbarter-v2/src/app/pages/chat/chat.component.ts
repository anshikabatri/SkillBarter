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
  template: `
    <div class="chat-page">
      <div class="contacts">
        <h2 class="contacts-title">
          Messages
          <span class="title-dot" *ngIf="hasUnreadSessions"></span>
        </h2>
        <input type="text" [(ngModel)]="search" class="input si" placeholder="Search...">
        <div class="loading" *ngIf="loadingSessions">Loading conversations...</div>
        <div class="empty-c" *ngIf="!loadingSessions && sessions.length===0">No sessions yet. Match with someone first!</div>

        <div class="contact" *ngFor="let s of filtered" [class.active]="selected?.sessionId===s.sessionId" [class.unread]="isUnread(s)" (click)="selectSession(s)">
          <div class="cav-wrap">
            <div class="cav" [style.background]="gc(getOther(s))">{{ getOther(s)?.charAt(0) }}</div>
            <span class="notify-dot" *ngIf="isUnread(s)"></span>
          </div>
          <div class="cinfo">
            <div class="cname" [class.unread-text]="isUnread(s)">{{ getOther(s) }}</div>
            <div class="clast" [class.unread-text]="isUnread(s)">{{ s.lastMessagePreview || s.skill?.name || 'Session' }}</div>
          </div>
          <div class="ctime-wrap">
            <div class="ctime">{{ s.scheduledAt | date:'MMM d' }}</div>
            <div class="ctime-symbol" *ngIf="isUnread(s)">●</div>
          </div>
        </div>
      </div>

      <div class="chat-win" *ngIf="selected">
        <div class="chat-header">
          <div class="chav" [style.background]="gc(getOther(selected))">{{ getOther(selected)?.charAt(0) }}</div>
          <div><h3>{{ getOther(selected) }}</h3><span class="skill-tag">{{ selected.skill?.name }}</span></div>
        </div>
        <div class="messages" #messagesContainer>
          <div class="loading" *ngIf="loadingMsgs">Loading messages...</div>
          <div class="empty-m" *ngIf="!loadingMsgs && messages.length===0">No messages yet. Say hello!</div>
          <div *ngFor="let m of messages" class="msg" [class.mine]="m.sender?.userId===me?.userId" [class.theirs]="m.sender?.userId!==me?.userId">
            <div class="bubble">{{ m.content }}</div>
            <div class="mtime">{{ m.sentAt | date:'h:mm a' }}</div>
          </div>
        </div>
        <div class="input-row">
          <input type="text" [(ngModel)]="newMsg" class="input mi" placeholder="Write a message..." (keyup.enter)="send()">
          <button class="btn-primary" (click)="send()">Send</button>
        </div>
      </div>

      <div class="no-chat" *ngIf="!selected">
        <div class="nc-icon">💬</div>
        <p>Select a conversation to start chatting</p>
      </div>
    </div>
  `,
  styles: [`
    .chat-page { display:flex; gap:0; height:calc(100vh - 88px); border-radius:16px; overflow:hidden; border:1px solid var(--border); }
    .contacts { width:260px; min-width:240px; background:var(--card); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:16px 0; }
    .contacts-title { display:flex; align-items:center; gap:8px; font-size:17px; font-weight:700; padding:0 16px 12px; }
    .title-dot { width:10px; height:10px; border-radius:50%; background:#22c55e; box-shadow:0 0 0 3px rgba(34,197,94,0.18); flex-shrink:0; }
    .si { margin:0 12px 12px; width:auto; font-size:13px; }
    .loading,.empty-c { color:var(--text2); font-size:13px; padding:12px 16px; }
    .contact { display:flex; align-items:center; gap:10px; padding:10px 14px; cursor:pointer; transition:background 0.15s; }
    .contact:hover { background:var(--bg3); }
    .contact.active { background:var(--blue-glow); border-right:2px solid var(--blue); }
    .contact.unread .cname { font-weight:800; }
    .contact.unread .clast { font-weight:600; color:var(--text); }
    .cav-wrap { position:relative; width:38px; height:38px; flex-shrink:0; }
    .cav { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; color:white; }
    .notify-dot { position:absolute; right:-2px; top:-2px; width:11px; height:11px; border-radius:50%; background:#22c55e; border:2px solid var(--card); box-shadow:0 0 0 2px rgba(34,197,94,0.18); }
    .cinfo { flex:1; min-width:0; }
    .cname { font-size:14px; font-weight:600; }
    .cname.unread-text { color:var(--text); }
    .clast { font-size:12px; color:var(--text2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .clast.unread-text { color:var(--text); }
    .ctime-wrap { display:flex; flex-direction:column; align-items:flex-end; gap:2px; }
    .ctime { font-size:11px; color:var(--text3); white-space:nowrap; }
    .ctime-symbol { font-size:10px; color:#22c55e; line-height:1; }
    .chat-win { flex:1; display:flex; flex-direction:column; background:var(--bg2); }
    .chat-header { display:flex; align-items:center; gap:12px; padding:14px 18px; border-bottom:1px solid var(--border); background:var(--card); }
    .chav { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:white; }
    .chat-header h3 { font-size:15px; font-weight:700; }
    .skill-tag { font-size:11px; color:var(--blue); background:var(--blue-glow); padding:2px 8px; border-radius:10px; }
    .messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:8px; }
    .empty-m { color:var(--text2); font-size:13px; text-align:center; margin:auto; }
    .msg { display:flex; flex-direction:column; }
    .msg.mine { align-items:flex-end; }
    .msg.theirs { align-items:flex-start; }
    .bubble { max-width:65%; padding:10px 14px; border-radius:14px; font-size:14px; line-height:1.5; }
    .mine .bubble { background:var(--blue); color:white; border-bottom-right-radius:4px; }
    .theirs .bubble { background:var(--card); border:1px solid var(--border); border-bottom-left-radius:4px; }
    .mtime { font-size:11px; color:var(--text3); margin-top:2px; }
    .input-row { display:flex; gap:10px; padding:14px 16px; border-top:1px solid var(--border); background:var(--card); }
    .mi { flex:1; }
    .no-chat { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text2); gap:12px; }
    .nc-icon { font-size:48px; opacity:0.3; }
  `]
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
