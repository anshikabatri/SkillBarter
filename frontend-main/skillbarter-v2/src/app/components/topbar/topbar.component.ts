import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="topbar">
      <div class="topbar-center">
        <div class="sp-badge">
          <span class="sp-label">SP</span>
          <span class="sp-value">{{ user?.xp || user?.xpPoints || user?.skillPoints || 0 }} SP</span>
        </div>
      </div>
      <div class="topbar-right">
        <button class="icon-btn" (click)="toggleNotif($event)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
        </button>
        <div class="user-btn" (click)="toggleMenu($event)">
          <div class="avatar-circle">{{ userInitial }}</div>
          <span class="user-name">{{ user?.name || 'User' }}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          <div class="dropdown" *ngIf="showMenu" (click)="$event.stopPropagation()">
            <a routerLink="/app/profile" class="dd-item" (click)="showMenu=false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>Profile
            </a>
            <a routerLink="/app/saved-profiles" class="dd-item" (click)="showMenu=false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>Saved Profiles
            </a>
            <a routerLink="/app/subscriptions" class="dd-item" (click)="showMenu=false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Subscriptions
            </a>
            <div class="dd-divider"></div>
            <button class="dd-item logout" (click)="logout()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Log Out
            </button>
          </div>
        </div>
      </div>
      <div class="notif-panel" *ngIf="showNotif" (click)="$event.stopPropagation()">
        <div class="notif-header">
          <h3>Notifications</h3>
          <button class="mark-all" (click)="markAllRead()" *ngIf="unreadCount>0">Mark all read</button>
        </div>
        <div class="notif-empty" *ngIf="notifications.length===0">No notifications yet</div>
        <div class="notif-item" *ngFor="let n of notifications" [class.unread]="!n.isRead" (click)="markRead(n)">
          <div class="notif-title">{{ n.type || 'Notification' }}</div>
          <div class="notif-msg">{{ n.content || n.message }}</div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar { position:fixed; top:0; left:var(--sidebar); right:0; height:var(--topbar); background:var(--bg2); border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 24px; z-index:99; }
    .topbar-center { flex:1; display:flex; justify-content:center; }
    .sp-badge { display:flex; align-items:center; gap:8px; background:var(--bg3); border:1px solid var(--border); border-radius:20px; padding:6px 16px; }
    .sp-label { background:var(--blue); color:white; font-size:10px; font-weight:800; padding:2px 7px; border-radius:10px; font-family:'Syne',sans-serif; }
    .sp-value { font-weight:700; font-size:14px; font-family:'Syne',sans-serif; }
    .topbar-right { display:flex; align-items:center; gap:12px; }
    .icon-btn { position:relative; background:var(--bg3); border:1px solid var(--border2); border-radius:8px; color:var(--text2); cursor:pointer; padding:7px 9px; display:flex; align-items:center; transition:all 0.2s; }
    .icon-btn:hover { color:var(--text); border-color:var(--blue); }
    .badge { position:absolute; top:-4px; right:-4px; background:var(--red); color:white; font-size:10px; font-weight:700; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
    .user-btn { display:flex; align-items:center; gap:8px; cursor:pointer; position:relative; padding:6px 10px; border-radius:10px; transition:background 0.2s; }
    .user-btn:hover { background:var(--bg3); }
    .avatar-circle { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,var(--blue),#8b5cf6); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:white; font-family:'Syne',sans-serif; }
    .user-name { font-size:14px; font-weight:600; }
    .dropdown { position:absolute; top:calc(100% + 8px); right:0; background:var(--card2); border:1px solid var(--border); border-radius:12px; min-width:180px; padding:6px; z-index:200; box-shadow:0 8px 32px rgba(0,0,0,0.4); }
    .dd-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; color:var(--text2); font-size:13px; cursor:pointer; text-decoration:none; background:none; border:none; width:100%; text-align:left; transition:all 0.15s; }
    .dd-item:hover { background:var(--bg3); color:var(--text); }
    .dd-item.logout { color:var(--red); }
    .dd-divider { height:1px; background:var(--border); margin:4px 0; }
    .notif-panel { position:absolute; top:68px; right:24px; background:var(--card); border:1px solid var(--border); border-radius:16px; width:340px; padding:16px; z-index:200; box-shadow:0 8px 32px rgba(0,0,0,0.5); }
    .notif-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
    .notif-header h3 { font-size:16px; font-weight:700; }
    .mark-all { background:none; border:none; color:var(--blue); font-size:12px; cursor:pointer; }
    .notif-empty { text-align:center; color:var(--text2); font-size:14px; padding:20px 0; }
    .notif-item { padding:12px; border-radius:10px; margin-bottom:6px; cursor:pointer; transition:background 0.15s; border:1px solid transparent; }
    .notif-item:hover { background:var(--bg3); }
    .notif-item.unread { border-color:var(--border); background:var(--bg3); }
    .notif-title { font-size:13px; font-weight:600; margin-bottom:3px; }
    .notif-msg { font-size:12px; color:var(--text2); }
  `]
})
export class TopbarComponent implements OnInit {
  user: any = null;
  showMenu = false; showNotif = false;
  notifications: any[] = []; unreadCount = 0;
  get userInitial() { return this.user?.name ? this.user.name.charAt(0).toUpperCase() : 'U'; }

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => { this.user = u; if (u?.userId) this.loadNotifs(u.userId); });
    if (!this.auth.currentUser && this.auth.isLoggedIn) {
      this.auth.resolveAndStoreCurrentUser().subscribe({ next: () => {}, error: () => {} });
    }
  }

  loadNotifs(userId: number) {
    this.api.getNotifications(userId).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        this.notifications = list.map((n: any) => ({ ...n, message: n?.message || n?.content }));
        this.unreadCount = this.notifications.filter((n: any) => !n.isRead).length;
      },
      error: () => {}
    });
  }

  markRead(n: any) {
    if (n.isRead) return;
    this.api.markNotificationRead(n.notificationId).subscribe({ next: () => { n.isRead = true; this.unreadCount = Math.max(0, this.unreadCount - 1); }, error: () => {} });
  }

  markAllRead() {
    if (!this.user?.userId) return;
    this.api.markAllNotificationsRead(this.user.userId).subscribe({ next: () => { this.notifications.forEach(n => n.isRead = true); this.unreadCount = 0; }, error: () => {} });
  }

  toggleMenu(e: Event) { e.stopPropagation(); this.showMenu = !this.showMenu; this.showNotif = false; }
  toggleNotif(e: Event) { e.stopPropagation(); this.showNotif = !this.showNotif; this.showMenu = false; }
  logout() { this.auth.logout(); }
  @HostListener('document:click') closeAll() { this.showMenu = false; this.showNotif = false; }
}
