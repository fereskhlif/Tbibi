import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChronicConditionAnalyticsService {

  private apiUrl = 'http://localhost:8089/api/chronic';

  constructor(private http: HttpClient) { }

  /** JPQL JOIN based patient health summary */
  getHealthSummary(doctorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctor/${doctorId}/health-summary`);
  }

  /** Keyword query based recent critical readings */
  getRecentCritical(doctorId: number, hours: number = 24): Observable<any[]> {
    let params = new HttpParams().set('hours', hours.toString());
    return this.http.get<any[]>(`${this.apiUrl}/doctor/${doctorId}/recent-critical`, { params });
  }
}
