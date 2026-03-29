import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TreatmentPlan, TreatmentPlanRequest } from '../models/treatment-plan.model';

@Injectable({
  providedIn: 'root'
})
export class TreatmentPlanService {
  private apiUrl = 'http://localhost:8088/api/treatment-plan';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TreatmentPlan[]> {
    return this.http.get<TreatmentPlan[]>(this.apiUrl);
  }

  getById(id: number): Observable<TreatmentPlan> {
    return this.http.get<TreatmentPlan>(`${this.apiUrl}/${id}`);
  }

  getByPatient(patientId: number): Observable<TreatmentPlan[]> {
    return this.http.get<TreatmentPlan[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getByPhysiotherapist(physiotherapistId: number): Observable<TreatmentPlan[]> {
    return this.http.get<TreatmentPlan[]>(`${this.apiUrl}/physiotherapist/${physiotherapistId}`);
  }

  getByPhysiotherapistAndStatus(physiotherapistId: number, status: string): Observable<TreatmentPlan[]> {
    return this.http.get<TreatmentPlan[]>(`${this.apiUrl}/physiotherapist/${physiotherapistId}/status/${status}`);
  }

  create(request: TreatmentPlanRequest): Observable<TreatmentPlan> {
    return this.http.post<TreatmentPlan>(this.apiUrl, request);
  }

  update(id: number, request: TreatmentPlanRequest): Observable<TreatmentPlan> {
    return this.http.put<TreatmentPlan>(`${this.apiUrl}/${id}`, request);
  }

  updateStatus(id: number, status: string): Observable<TreatmentPlan> {
    return this.http.put<TreatmentPlan>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }
}
