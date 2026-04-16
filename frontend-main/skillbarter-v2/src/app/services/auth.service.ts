import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  userId: number;
  name: string;
  email: string;
  bio?: string;
  profilePhotoUrl?: string;
  skillPoints?: number;
  xpPoints?: number;
  xp?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private normalizeUser(user: any): User {
    const xp = Number(user?.xp ?? user?.xpPoints ?? user?.skillPoints ?? 0);
    return {
      ...user,
      xp,
      xpPoints: xp,
      skillPoints: xp
    } as User;
  }

  private loadUser(): User | null {
    try {
      const raw = JSON.parse(localStorage.getItem('user') || 'null');
      return raw ? this.normalizeUser(raw) : null;
    } catch {
      return null;
    }
  }

  private decodeEmailFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      return payload?.sub || null;
    } catch {
      return null;
    }
  }

  get currentUser(): User | null { return this.userSubject.value; }
  get isLoggedIn(): boolean { return !!localStorage.getItem('token'); }

  // POST /api/auth/register → returns User object directly
  register(name: string, email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.api}/auth/register`, { name, email, password }).pipe(
      tap((user: User) => {
        // Register returns the user, but no token yet — must login after
        localStorage.setItem('pendingUser', JSON.stringify(user));
      })
    );
  }

  // POST /api/auth/login → returns { token: "eyJ..." }
  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.api}/auth/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        const decodedEmail = this.decodeEmailFromToken(res.token);
        if (decodedEmail) localStorage.setItem('userEmail', decodedEmail);
      })
    );
  }

  // Legacy compatibility method
  fetchUserByEmail(email: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users`).pipe(
      map(users => (users || []).filter(u => (u?.email || '').toLowerCase() === (email || '').toLowerCase())),
      map(users => users.map(u => this.normalizeUser(u)))
    );
  }

  fetchUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.api}/users/${id}`).pipe(
      tap(user => {
        this.setUser(user);
      })
    );
  }

  resolveAndStoreCurrentUser(): Observable<User> {
    const existing = this.currentUser;
    if (existing?.userId) return of(existing);

    const email = localStorage.getItem('userEmail') || this.decodeEmailFromToken(localStorage.getItem('token'));
    if (!email) return throwError(() => new Error('No authenticated user context found'));

    return this.http.get<User[]>(`${this.api}/users`).pipe(
      map(users => (users || []).find(u => (u?.email || '').toLowerCase() === email.toLowerCase())),
      switchMap(user => {
        if (!user?.userId) return throwError(() => new Error('Authenticated user not found in database'));
        const normalized = this.normalizeUser(user);
        this.setUser(normalized);
        return of(normalized);
      })
    );
  }

  setUser(user: User): void {
    const normalized = this.normalizeUser(user);
    localStorage.setItem('user', JSON.stringify(normalized));
    localStorage.setItem('userEmail', normalized.email || '');
    this.userSubject.next(normalized);
  }

  logout(): void {
    localStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
