import { Component } from '@angular/core';
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
  features = [
    { icon: '🤝', title: 'Smart Matching', desc: 'AI-powered matching based on what you teach and want to learn.' },
    { icon: '💬', title: 'Built-in Chat', desc: 'Message matches and schedule sessions without leaving the platform.' },
    { icon: '📅', title: 'Calendar', desc: 'Book sessions and manage your schedule in one place.' },
    { icon: '🏆', title: 'Earn XP', desc: 'Level up, collect badges, and build your reputation as you grow.' }
  ];
}
