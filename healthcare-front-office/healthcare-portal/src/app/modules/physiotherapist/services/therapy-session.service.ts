import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TherapySessionRequest, TherapySessionResponse } from '../models/therapy-session.model';

@Injectable({
  providedIn: 'root'
})
export class TherapySessionService {
  private apiUrl = 'http://localhost:8088/api/therapy-session';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TherapySessionResponse[]> {
    return this.http.get<TherapySessionResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<TherapySessionResponse> {
    return this.http.get<TherapySessionResponse>(`${this.apiUrl}/${id}`);
  }

  getByPatient(patientId: number): Observable<TherapySessionResponse[]> {
    return this.http.get<TherapySessionResponse[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getByPhysiotherapist(physioId: number): Observable<TherapySessionResponse[]> {
    return this.http.get<TherapySessionResponse[]>(`${this.apiUrl}/physiotherapist/${physioId}`);
  }

  getUpcomingSessions(physioId: number): Observable<TherapySessionResponse[]> {
    return this.http.get<TherapySessionResponse[]>(`${this.apiUrl}/physiotherapist/${physioId}/upcoming`);
  }

  create(request: TherapySessionRequest): Observable<TherapySessionResponse> {
    return this.http.post<TherapySessionResponse>(this.apiUrl, request);
  }

  update(id: number, request: TherapySessionRequest): Observable<TherapySessionResponse> {
    return this.http.put<TherapySessionResponse>(`${this.apiUrl}/${id}`, request);
  }

  startSession(id: number): Observable<TherapySessionResponse> {
    return this.http.put<TherapySessionResponse>(`${this.apiUrl}/${id}/start`, {});
  }

  documentSession(id: number, exercisesPerformed: string, sessionNotes: string): Observable<TherapySessionResponse> {
    const params = new HttpParams()
      .set('exercisesPerformed', exercisesPerformed)
      .set('sessionNotes', sessionNotes);
    return this.http.put<TherapySessionResponse>(`${this.apiUrl}/${id}/document`, {}, { params });
  }

  completeSession(id: number, request: Partial<TherapySessionRequest>): Observable<TherapySessionResponse> {
    return this.http.put<TherapySessionResponse>(`${this.apiUrl}/${id}/complete`, request);
  }

  cancelSession(id: number): Observable<TherapySessionResponse> {
    return this.http.put<TherapySessionResponse>(`${this.apiUrl}/${id}/cancel`, {});
  }

  rescheduleSession(id: number, newDate: string, newStartTime: string, newEndTime: string): Observable<TherapySessionResponse> {
    const params = new HttpParams()
      .set('newDate', newDate)
      .set('newStartTime', newStartTime)
      .set('newEndTime', newEndTime);
    return this.http.put<TherapySessionResponse>(`${this.apiUrl}/${id}/reschedule`, {}, { params });
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}