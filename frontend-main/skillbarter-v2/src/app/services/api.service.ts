import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // ── USERS ── /api/users
  getUser(id: number): Observable<any> { return this.http.get(`${this.base}/users/${id}`); }
  getAllUsers(): Observable<any[]> { return this.http.get<any[]>(`${this.base}/users`); }
  searchUsers(name: string): Observable<any[]> { return this.http.get<any[]>(`${this.base}/users/search?name=${name}`); }
  updateUser(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/users/${id}`, data); }
  addXp(id: number, points: number): Observable<any> { return this.http.patch(`${this.base}/users/${id}/xp?points=${points}`, {}); }
  uploadProfilePhoto(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.base}/users/${id}/photo`, formData);
  }

  // ── SKILLS ── /api/skills & /api/user-skills
  searchSkills(query: string): Observable<any[]> { return this.http.get<any[]>(`${this.base}/skills/search?query=${query}`); }
  getSkillsByCategory(id: number): Observable<any[]> { return this.http.get<any[]>(`${this.base}/skills/category/${id}`); }
  getUserSkills(userId: number): Observable<any[]> { return this.http.get<any[]>(`${this.base}/user-skills/${userId}`); }
  addUserSkill(data: any): Observable<any> { return this.http.post(`${this.base}/user-skills`, data); }

  // ── MATCHES ── /api/matches
  getMatchesByUser(userId: number): Observable<any[]> { return this.http.get<any[]>(`${this.base}/matches/user/${userId}`); }
  getLeaderboard(): Observable<any[]> { return this.http.get<any[]>(`${this.base}/matches/leaderboard`); }
  getMatchSuggestions(userId: number): Observable<any[]> { return this.http.get<any[]>(`${this.base}/matches/suggestions/${userId}`); }
  createMatch(data: any): Observable<any> { return this.http.post(`${this.base}/matches`, data); }

  // ── SESSIONS ── /api/sessions
  getSessionsByMentor(id: number): Observable<any[]> {
    return this.http.get(`${this.base}/sessions/mentor/${id}`).pipe(map((res: any) => res?.data || res || []));
  }
  getSessionsByLearner(id: number): Observable<any[]> {
    return this.http.get(`${this.base}/sessions/learner/${id}`).pipe(map((res: any) => res?.data || res || []));
  }
  createSession(data: any): Observable<any> { return this.http.post(`${this.base}/sessions`, data); }
  updateSessionStatus(id: number, status: string): Observable<any> { return this.http.patch(`${this.base}/sessions/${id}/status?status=${status}`, {}); }

  // ── MESSAGES ── /api/messages
  getMessagesBySession(sessionId: number): Observable<any> { return this.http.get(`${this.base}/messages/session/${sessionId}`); }
  sendMessage(sessionId: number, senderId: number, content: string): Observable<any> {
    return this.http.post(`${this.base}/messages`, { sessionId, senderId, content });
  }

  // ── NOTIFICATIONS ── /api/notifications
  getNotifications(userId: number): Observable<any[]> { return this.http.get(`${this.base}/notifications/user/${userId}`).pipe(map((res: any) => res?.data || res || [])); }
  getUnreadNotifications(userId: number): Observable<any[]> { return this.http.get(`${this.base}/notifications/user/${userId}/unread`).pipe(map((res: any) => res?.data || res || [])); }
  markNotificationRead(id: number): Observable<any> { return this.http.put(`${this.base}/notifications/${id}/read`, {}).pipe(map((res: any) => res?.data || res || {})); }
  markAllNotificationsRead(userId: number): Observable<any> { return this.http.put(`${this.base}/notifications/user/${userId}/read-all`, {}).pipe(map((res: any) => res?.data || res || {})); }

  // ── REVIEWS ── /api/reviews
  getReviewsByReviewee(id: number): Observable<any[]> {
    return this.http.get(`${this.base}/reviews/reviewee/${id}`).pipe(map((res: any) => res?.data || res || []));
  }
  getAverageRating(id: number): Observable<number> {
    return this.http.get(`${this.base}/reviews/reviewee/${id}/average`).pipe(map((res: any) => Number(res?.data ?? res ?? 0) || 0));
  }
  addReview(reviewerId: number, revieweeId: number, rating: number, reviewText: string): Observable<any> {
    return this.http.post(`${this.base}/reviews`, { reviewerId, revieweeId, rating, reviewText });
  }

  // ── STORIES ── /api/stories
  getAllStories(): Observable<any[]> { return this.http.get<any[]>(`${this.base}/stories`); }
  createStory(data: any): Observable<any> { return this.http.post(`${this.base}/stories`, data); }

  // ── CALENDAR ── /api/calendar
  getCalendarByUser(userId: number): Observable<any[]> { return this.http.get<any[]>(`${this.base}/calendar/user/${userId}`); }
  getUpcomingEvents(userId: number): Observable<any[]> { return this.http.get<any[]>(`${this.base}/calendar/user/${userId}/upcoming`); }
  createCalendarEvent(data: any): Observable<any> { return this.http.post(`${this.base}/calendar`, data); }

  // ── TRANSACTIONS ── /api/transactions
  getTransactionsByUser(userId: number): Observable<any[]> { return this.http.get<any[]>(`${this.base}/transactions/user/${userId}`); }

  // ── AUTH: PASSWORD RESET ── /api/auth
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.base}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.base}/auth/reset-password`, { token, newPassword });
  }
}
