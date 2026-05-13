import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  theme: 'dark' | 'light' = 'dark';
  features = [
    { icon: '🤝', title: 'Smart Matching', desc: 'AI-powered matching based on what you teach and want to learn.' },
    { icon: '💬', title: 'Built-in Chat', desc: 'Message matches and schedule sessions without leaving the platform.' },
    { icon: '📅', title: 'Calendar', desc: 'Book sessions and manage your schedule in one place.' },
    { icon: '🏆', title: 'Earn XP', desc: 'Level up, collect badges, and build your reputation as you grow.' }
  ];

  ngOnInit(): void {
    const saved = localStorage.getItem('sb-theme') || localStorage.getItem('theme');
    this.theme = saved === 'light' || saved === 'dark' ? saved : 'dark';
    this.applyTheme(this.theme, false);
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.theme);
  }

  private applyTheme(theme: 'dark' | 'light', persist = true): void {
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
