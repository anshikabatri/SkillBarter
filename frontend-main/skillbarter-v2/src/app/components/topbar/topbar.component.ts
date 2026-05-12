import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit, OnDestroy {
  user: any = null;
  theme: 'dark' | 'light' = 'dark';
  showMenu = false;
  showNotif = false;
  notifications: any[] = [];
  unreadCount = 0;
  incomingCall: any = null;
  incomingTip: any = null;
  private pollSub?: Subscription;

  get userInitial() { return this.user?.name ? this.user.name.charAt(0).toUpperCase() : 'U'; }

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    const saved = localStorage.getItem('sb-theme') || localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') this.theme = saved as 'light' | 'dark';
    if (this.theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');

    this.auth.currentUser$.subscribe(u => {
      this.user = u;
      if (u?.userId) {
        this.loadNotifs(u.userId);
        this.startPolling(u.userId);
      }
    });
    if (!this.auth.currentUser && this.auth.isLoggedIn) {
      this.auth.resolveAndStoreCurrentUser().subscribe({ next: () => {}, error: () => {} });
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    if (this.theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('sb-theme', this.theme);
    localStorage.setItem('theme', this.theme);
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  startPolling(userId: number) {
    this.pollSub?.unsubscribe();
    this.pollSub = interval(5000).subscribe(() => {
      this.loadNotifs(userId);
    });
  }

  loadNotifs(userId: number) {
    this.api.getNotifications(userId).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        this.notifications = list.map((n: any) => ({ ...n, message: n?.message || n?.content }));
        this.notifications = this.notifications.filter((n: any) => !n.isRead);
        this.unreadCount = this.notifications.length;
        this.checkIncomingCall();
      },
      error: () => {}
    });
  }

  checkIncomingCall() {
    const callNotif = this.notifications.find((n: any) =>
      !n.isRead &&
      (n.content || n.message || '').includes('is calling you') &&
      !localStorage.getItem(`call-dismissed-${n.notificationId}`)
    );
    if (callNotif && !this.incomingCall) {
      this.incomingCall = callNotif;
    }

    const tipNotif = this.notifications.find((n: any) =>
      !n.isRead &&
      (n.content || n.message || '').includes('sent you a tip') &&
      !localStorage.getItem(`tip-dismissed-${n.notificationId}`)
    );
    if (tipNotif && !this.incomingTip) {
      this.incomingTip = tipNotif;
      setTimeout(() => { this.dismissTip(); }, 5000);
    }
  }

  dismissTip() {
    if (!this.incomingTip) return;
    localStorage.setItem(`tip-dismissed-${this.incomingTip.notificationId}`, 'true');
    this.api.markNotificationRead(this.incomingTip.notificationId).subscribe();
    this.incomingTip = null;
  }

  acceptCall() {
    if (!this.incomingCall) return;
    const content = this.incomingCall.content || this.incomingCall.message || '';
    const match = content.match(/session #(\d+)/);
    const sessionId = match ? match[1] : null;
    localStorage.setItem(`call-dismissed-${this.incomingCall.notificationId}`, 'true');
    this.api.markNotificationRead(this.incomingCall.notificationId).subscribe();
    this.incomingCall = null;
    if (sessionId) {
      window.open(`https://meet.element.io/skillbarter-session-${sessionId}`, '_blank');
    }
  }

  declineCall() {
    if (!this.incomingCall) return;
    localStorage.setItem(`call-dismissed-${this.incomingCall.notificationId}`, 'true');
    this.api.markNotificationRead(this.incomingCall.notificationId).subscribe();
    this.incomingCall = null;
  }

  markRead(n: any) {
    if (n.isRead) return;
    this.api.markNotificationRead(n.notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter((item: any) => Number(item.notificationId) !== Number(n.notificationId));
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: () => {}
    });
  }

  markAllRead() {
    if (!this.user?.userId) return;
    this.api.markAllNotificationsRead(this.user.userId).subscribe({
      next: () => { this.notifications = []; this.unreadCount = 0; },
      error: () => {}
    });
  }

  toggleMenu(e: Event) { e.stopPropagation(); this.showMenu = !this.showMenu; this.showNotif = false; }
  toggleNotif(e: Event) { e.stopPropagation(); this.showNotif = !this.showNotif; this.showMenu = false; }
  logout() { this.auth.logout(); }

  @HostListener('document:click')
  closeAll() { this.showMenu = false; this.showNotif = false; }
}