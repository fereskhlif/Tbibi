import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AiChatResponse {
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {

  private readonly apiUrl = 'http://localhost:8088/api/ai-chat/ask';

  constructor(private http: HttpClient) {}

  /**
   * Sends a patient question to the backend Gemma AI service.
   * The backend injects medical knowledge (ICL) before calling Groq.
   */
  ask(question: string): Observable<string> {
    return this.http.post<AiChatResponse>(this.apiUrl, { question })
      .pipe(map(res => res.answer));
  }
}
