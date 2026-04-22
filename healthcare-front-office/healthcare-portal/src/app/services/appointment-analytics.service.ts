import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentAnalyticsService {

  private apiUrl = 'http://localhost:8089/appointement';

  constructor(private http: HttpClient) { }

  /** JPQL JOIN based specialty statistics */
  getSpecialtyStats(doctorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctor/${doctorId}/specialty-stats`);
  }

  /** Keyword filtered appointment query */
  getFilteredAppointments(doctorId: number, from: string, to: string, status: string): Observable<any[]> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('status', status);
      
    return this.http.get<any[]>(`${this.apiUrl}/doctor/${doctorId}/filtered`, { params });
  }
}
