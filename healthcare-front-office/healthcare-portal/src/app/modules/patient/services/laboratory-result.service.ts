import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Interface Response — ce que le backend retourne
export interface LaboratoryResult {
  labId: number;
  testName: string;
  location: string;
  nameLabo: string;
  resultValue: string;
  status: string;
  testDate: string;
  laboratoryUserId: number;
  laboratoryUserName: string;
  patientId?: number;
  patientName?: string;
  notificationMessage?: string;
  notificationSent: boolean;
  notificationDate?: string;
  createdAt?: string;
  scheduledNotifSent?: boolean;
  expanded?: boolean;
}

// ✅ Interface Request — ce qu'on envoie au backend
export interface LaboratoryResultRequest {
  testName: string;
  location: string;
  nameLabo: string;
  resultValue: string;
  status: string;
  testDate: string;
  laboratoryUserId: number;
  patientId?: number;   // optionnel
}

@Injectable({
  providedIn: 'root'
})
export class LaboratoryResultService {

  private apiUrl = 'http://localhost:8088/api/laboratory-results';

  constructor(private http: HttpClient) {}

  // ==================== GET ====================

  getAll(): Observable<LaboratoryResult[]> {
    return this.http.get<LaboratoryResult[]>(this.apiUrl);
  }

  getById(id: number): Observable<LaboratoryResult> {
    return this.http.get<LaboratoryResult>(`${this.apiUrl}/${id}`);
  }

  getByPatient(patientId: number): Observable<LaboratoryResult[]> {
    return this.http.get<LaboratoryResult[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getByLaboratoryUser(userId: number): Observable<LaboratoryResult[]> {
    return this.http.get<LaboratoryResult[]>(`${this.apiUrl}/user/${userId}`);
  }

  getByStatus(status: string): Observable<LaboratoryResult[]> {
    return this.http.get<LaboratoryResult[]>(`${this.apiUrl}/status/${status}`);
  }

  // ==================== POST ====================

  // POST /api/laboratory-results
  create(request: LaboratoryResultRequest): Observable<LaboratoryResult> {
    return this.http.post<LaboratoryResult>(this.apiUrl, request);
  }

  // ==================== PUT ====================

  // PUT /api/laboratory-results/{id}
  update(id: number, request: LaboratoryResultRequest): Observable<LaboratoryResult> {
    return this.http.put<LaboratoryResult>(`${this.apiUrl}/${id}`, request);
  }

  // PUT /api/laboratory-results/{id}/status?newStatus=Completed
  updateStatus(id: number, newStatus: string): Observable<LaboratoryResult> {
    return this.http.put<LaboratoryResult>(
      `${this.apiUrl}/${id}/status`,
      null,
      { params: { newStatus } }
    );
  }

  // ==================== DELETE ====================

  // DELETE /api/laboratory-results/{id}
  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }
}