import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit {
  user: any = null;
  showMenu = false; showNotif = false;
  notifications: any[] = []; unreadCount = 0;
  isLightMode = false;
  get userInitial() { return this.user?.name ? this.user.name.charAt(0).toUpperCase() : 'U'; }

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.isLightMode = (localStorage.getItem('theme') || 'dark') === 'light';
    document.documentElement.setAttribute('data-theme', this.isLightMode ? 'light' : 'dark');
    this.auth.currentUser$.subscribe(u => { this.user = u; if (u?.userId) this.loadNotifs(u.userId); });
    if (!this.auth.currentUser && this.auth.isLoggedIn) {
      this.auth.resolveAndStoreCurrentUser().subscribe({ next: () => {}, error: () => {} });
    }
  }

  toggleTheme(e: Event) {
    e.stopPropagation();
    this.isLightMode = !this.isLightMode;
    const theme = this.isLightMode ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
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
