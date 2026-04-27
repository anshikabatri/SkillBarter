import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.css'
})
export class MatchesComponent implements OnInit {
  tab = 'find';
  searchQuery = ''; searchResults: any[] = []; myMatches: any[] = [];
  loading = false; searched = false; message = '';
  colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  gc(n: string) { return this.colors[(n?.charCodeAt(0)||0) % this.colors.length]; }

  private normalizeScore(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  displayScore(v: any): string {
    const n = this.normalizeScore(v);
    if (n === null) return 'N/A match';
    return `${Math.round(n)}% match`;
  }

  constructor(private auth: AuthService, private api: ApiService) {}
  ngOnInit() { this.loadAllUsers(); this.loadMyMatches(); }

  private ensureUser(): Observable<any> {
    const u = this.auth.currentUser;
    if (u?.userId) return of(u);
    return this.auth.resolveAndStoreCurrentUser();
  }

  otherUser(m: any) {
    const me = this.auth.currentUser;
    return m?.user1?.userId === me?.userId ? m?.user2 : m?.user1;
  }

  loadAllUsers() {
    this.ensureUser().subscribe({
      next: (me) => {
        this.loading = true;
        this.api.getMatchSuggestions(me.userId).subscribe({
          next: d => {
            this.searchResults = (d||[])
              .filter((u: any) => u?.user?.userId !== me.userId)
              .map((u: any) => ({ ...u, score: this.normalizeScore(u?.score) ?? 0 }));
            this.loading = false;
            this.searched = true;
          },
          error: () => {
            this.loading = false;
            this.message = 'Failed to load match suggestions.';
          }
        });
      },
      error: () => {
        this.message = 'Please login again to load matches.';
      }
    });
  }

  searchUsers() {
    if (!this.searchQuery.trim()) { this.loadAllUsers(); return; }
    this.loading = true; this.searched = true;
    this.ensureUser().subscribe({
      next: (me) => {
        this.api.getMatchSuggestions(me?.userId).subscribe({
          next: d => {
            this.searchResults = (d||[])
              .filter((u: any) => u?.user?.userId !== me?.userId)
              .filter((u: any) => ((u?.user?.name || '').toLowerCase().includes(this.searchQuery.toLowerCase())))
              .map((u: any) => ({ ...u, score: this.normalizeScore(u?.score) ?? 0 }));
            this.loading = false;
          },
          error: () => this.loading = false
        });
      },
      error: () => {
        this.loading = false;
        this.message = 'Please login again to search matches.';
      }
    });
  }

  loadMyMatches() {
    this.ensureUser().subscribe({
      next: (u) => {
        this.loading = true;
        this.api.getMatchesByUser(u.userId).subscribe({
          next: d => {
            this.myMatches = (d||[]).map((m: any) => ({ ...m, matchScore: this.normalizeScore(m?.matchScore) }));
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.message = 'Unable to load your matches.';
          }
        });
      },
      error: () => {
        this.message = 'Please login again to load your matches.';
      }
    });
  }

  createMatch(item: any) {
    const user = item?.user || item;
    this.ensureUser().subscribe({
      next: (me) => {
        this.message = '';
        this.api.createMatch({ user1: { userId: me.userId }, user2: { userId: user.userId } }).subscribe({
          next: () => {
            this.message = `Connected with ${user.name}!`;
            this.tab = 'my';
            this.loadMyMatches();
            this.loadAllUsers();
          },
          error: (e) => {
            this.message = e?.error?.message || 'Already connected or error occurred.';
          }
        });
      },
      error: () => {
        this.message = 'Please login again to connect.';
      }
    });
  }
}
