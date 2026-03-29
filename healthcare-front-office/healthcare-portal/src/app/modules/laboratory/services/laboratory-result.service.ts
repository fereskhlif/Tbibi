import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LaboratoryResultRequest, LaboratoryResultResponse } from '../models/laboratory-result.model';

@Injectable({
  providedIn: 'root'
})
export class LaboratoryResultService {

  // ✅ URL corrigée — "laboratory-results" avec un s
  private apiUrl = 'http://localhost:8088/api/laboratory-results';

  constructor(private http: HttpClient) {}

  // ==================== CRUD DE BASE ====================

  getAll(): Observable<LaboratoryResultResponse[]> {
    return this.http.get<LaboratoryResultResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<LaboratoryResultResponse> {
    return this.http.get<LaboratoryResultResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: LaboratoryResultRequest): Observable<LaboratoryResultResponse> {
    return this.http.post<LaboratoryResultResponse>(this.apiUrl, request);
  }

  update(id: number, request: LaboratoryResultRequest): Observable<LaboratoryResultResponse> {
    return this.http.put<LaboratoryResultResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  // ==================== ENDPOINTS AVANCÉS ====================

  getByLaboratoryUser(userId: number): Observable<LaboratoryResultResponse[]> {
    return this.http.get<LaboratoryResultResponse[]>(`${this.apiUrl}/user/${userId}`);
  }

  // ✅ NOUVEAU — Résultats par patient
  getByPatient(patientId: number): Observable<LaboratoryResultResponse[]> {
    return this.http.get<LaboratoryResultResponse[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  // ✅ NOUVEAU — Résultats prescrits par un médecin
  getByDoctor(doctorId: number): Observable<LaboratoryResultResponse[]> {
    return this.http.get<LaboratoryResultResponse[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  getByStatus(status: string): Observable<LaboratoryResultResponse[]> {
    return this.http.get<LaboratoryResultResponse[]>(`${this.apiUrl}/status/${status}`);
  }

  // ✅ PUT au lieu de PATCH — correspond au backend
  updateStatus(id: number, newStatus: string): Observable<LaboratoryResultResponse> {
    return this.http.put<LaboratoryResultResponse>(
      `${this.apiUrl}/${id}/status?newStatus=${newStatus}`, {}
    );
  }

  // ✅ NOUVEAU — Filtrage par priorité
  getByPriority(priority: string): Observable<LaboratoryResultResponse[]> {
    return this.http.get<LaboratoryResultResponse[]>(`${this.apiUrl}/priority/${priority}`);
  }

  // ✅ NOUVEAU — Demandes en attente (triées par priorité)
  getPendingRequests(): Observable<LaboratoryResultResponse[]> {
    return this.http.get<LaboratoryResultResponse[]>(`${this.apiUrl}/pending-requests`);
  }

  // ✅ NOUVEAU — Demandes urgentes uniquement
  getUrgentRequests(): Observable<LaboratoryResultResponse[]> {
    return this.http.get<LaboratoryResultResponse[]>(`${this.apiUrl}/urgent-requests`);
  }
}
