import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent) },
  { path: 'profile-setup', loadComponent: () => import('./pages/profile-setup/profile-setup.component').then(m => m.ProfileSetupComponent), canActivate: [authGuard] },
  {
    path: 'app',
    loadComponent: () => import('./components/sidebar/sidebar.component').then(m => m.SidebarComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'matches', loadComponent: () => import('./pages/matches/matches.component').then(m => m.MatchesComponent) },
      { path: 'chat', loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent) },
      { path: 'calendar', loadComponent: () => import('./pages/calendar/calendar.component').then(m => m.CalendarComponent) },
      { path: 'progress', loadComponent: () => import('./pages/progress/progress.component').then(m => m.ProgressComponent) },
      { path: 'community', loadComponent: () => import('./pages/community/community.component').then(m => m.CommunityComponent) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'saved-profiles', loadComponent: () => import('./pages/saved-profiles/saved-profiles.component').then(m => m.SavedProfilesComponent) },
      { path: 'subscriptions', loadComponent: () => import('./pages/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
