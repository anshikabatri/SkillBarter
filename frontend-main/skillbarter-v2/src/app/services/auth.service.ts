import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  userId: number;
  name: string;
  email: string;
  bio?: string;
  profilePhotoUrl?: string;
  skillPoints?: number;
  xpPoints?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
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
        // Decode token to get email, then fetch user
        const payload = JSON.parse(atob(res.token.split('.')[1]));
        localStorage.setItem('userEmail', payload.sub);
      })
    );
  }

  // After login, fetch full user by searching
  fetchUserByEmail(email: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users/search?name=${email}`);
  }

  fetchUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.api}/users/${id}`).pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
      })
    );
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout(): void {
    localStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
