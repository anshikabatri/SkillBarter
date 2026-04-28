import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
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

  showThemeToggle(): boolean {
    const url = this.router.url;
    const hideOn = ['/', '/login', '/signup', '/forgot-password'];
    return !hideOn.includes(url);
  }

  ngOnInit(): void {
    const saved = localStorage.getItem('sb-theme');
    if (saved === 'light' || saved === 'dark') {
      this.theme = saved as 'light' | 'dark';
    } else {
      this.theme = 'dark';
    }
    if (this.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    if (this.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('sb-theme', this.theme);
  }
}
