import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly apiUrl = `${environment.apiUrl}/ai/chat`;

  constructor(private http: HttpClient) {}

  sendMessage(
    userMessage: string,
    language: string = 'en',
    conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = []
  ): Observable<any> {
    const requestBody = {
      userMessage,
      language,
      conversationHistory
    };

    return this.http.post(this.apiUrl, requestBody);
  }
}
