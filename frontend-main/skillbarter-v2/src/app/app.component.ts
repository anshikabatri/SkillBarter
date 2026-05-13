import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  theme: 'dark' | 'light' = 'dark';

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.syncThemeFromStorage();
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
      this.syncThemeFromStorage();
    });
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.theme);
  }

  isPublicRoute() {
    return this.router.url !== '/' && !this.router.url.startsWith('/app') && this.router.url !== '/profile-setup';
  }

  private syncThemeFromStorage() {
    const saved = localStorage.getItem('sb-theme') || localStorage.getItem('theme');
    this.theme = saved === 'light' || saved === 'dark' ? saved : 'dark';
    this.applyTheme(this.theme, false);
  }

  private applyTheme(theme: 'dark' | 'light', persist = true) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (persist) {
      localStorage.setItem('sb-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }
}
