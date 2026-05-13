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
  private currentUserId: number | null = null;
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
  ngOnInit() {
    this.ensureUser().subscribe({
      next: (me) => {
        this.currentUserId = me.userId;
        this.loadAllUsers(me.userId);
        this.loadMyMatches(me.userId);
      },
      error: () => {
        this.message = 'Please login again to load matches.';
      }
    });
  }

  private ensureUser(): Observable<any> {
    const u = this.auth.currentUser;
    if (u?.userId) return of(u);
    return this.auth.resolveAndStoreCurrentUser();
  }

  otherUser(m: any) {
    const meId = this.currentUserId ?? this.auth.currentUser?.userId;
    return Number(m?.user1?.userId) === Number(meId) ? m?.user2 : m?.user1;
  }

  loadAllUsers(userId: number = this.currentUserId ?? 0) {
    if (!userId) {
      this.message = 'Please login again to load matches.';
      return;
    }
    this.loading = true;
    this.api.getMatchSuggestions(userId).subscribe({
      next: d => {
        this.searchResults = (d||[])
          .filter((u: any) => Number(u?.user?.userId) !== Number(userId))
          .map((u: any) => ({ ...u, score: this.normalizeScore(u?.score) ?? 0 }));
        this.loading = false;
        this.searched = true;
      },
      error: () => {
        this.loading = false;
        this.message = 'Failed to load match suggestions.';
      }
    });
  }

  searchUsers() {
    const query = (this.searchQuery || '').trim();
    if (!query) { this.loadAllUsers(); return; }
    if (query.length < 2) {
      this.message = 'Please enter at least 2 characters to search.';
      return;
    }
    if (query.length > 80) {
      this.message = 'Search query cannot exceed 80 characters.';
      return;
    }
    this.searchQuery = query;
    this.message = '';
    this.loading = true; this.searched = true;
    const userId = this.currentUserId ?? this.auth.currentUser?.userId;
    if (!userId) { this.loading = false; this.message = 'Please login again to search matches.'; return; }
    this.api.getMatchSuggestions(userId).subscribe({
      next: d => {
        this.searchResults = (d||[])
          .filter((u: any) => Number(u?.user?.userId) !== Number(userId))
          .filter((u: any) => ((u?.user?.name || '').toLowerCase().includes(query.toLowerCase())))
          .map((u: any) => ({ ...u, score: this.normalizeScore(u?.score) ?? 0 }));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadMyMatches(userId: number = this.currentUserId ?? 0) {
    if (!userId) {
      this.message = 'Please login again to load your matches.';
      return;
    }
    this.loading = true;
    this.api.getMatchesByUser(userId).subscribe({
      next: d => {
        this.myMatches = (d||[]).map((m: any) => ({ ...m, matchScore: this.normalizeScore(m?.matchScore) }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.message = 'Unable to load your matches.';
      }
    });
  }

  createMatch(item: any) {
    const user = item?.user || item;
    const meId = this.currentUserId ?? this.auth.currentUser?.userId;
    if (!meId) { this.message = 'Please login again to connect.'; return; }
    this.message = '';
    this.api.createMatch({ user1: { userId: meId }, user2: { userId: user.userId } }).subscribe({
      next: () => {
        this.message = `Connected with ${user.name}!`;
        this.tab = 'my';
        this.loadMyMatches(meId);
        this.loadAllUsers(meId);
      },
      error: (e) => {
        this.message = e?.error?.message || 'Already connected or error occurred.';
      }
    });
  }
}
