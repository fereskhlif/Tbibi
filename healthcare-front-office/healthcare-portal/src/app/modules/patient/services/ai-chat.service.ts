import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AiChatResponse {
  answer:     string;
  session_id: string;
  latency_ms: number;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {

  private readonly apiUrl     = 'http://localhost:5000/ask';
  private readonly clearUrl   = 'http://localhost:5000/clear';

  constructor(private http: HttpClient) {}

  /**
   * Sends a patient question to the local AI service.
   * Includes session_id so the server can maintain conversation memory.
   */
  ask(question: string, sessionId: string): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(this.apiUrl, {
      question,
      session_id: sessionId
    });
  }

  /**
   * Clears the conversation memory for a session on the server.
   */
  clearSession(sessionId: string): Observable<any> {
    return this.http.post(this.clearUrl, { session_id: sessionId });
  }
}
