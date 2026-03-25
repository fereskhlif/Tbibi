import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChronicConditionRequest {
  patientId?: number;
  patientName: string;
  doctorId: number;
  conditionType: string;
  value: number;
  value2?: number;
  notes?: string;
  recordedAt?: string; // ISO datetime string from datetime-local input
}

export interface ChronicConditionResponse {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  conditionType: string;
  value: number;
  value2?: number;
  unit: string;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  notes?: string;
  recordedAt: string;
  displayValue: string;
}

@Injectable({ providedIn: 'root' })
export class ChronicConditionService {
  private readonly base = 'http://localhost:8088/api/chronic';

  constructor(private http: HttpClient) {}

  create(req: ChronicConditionRequest): Observable<ChronicConditionResponse> {
    return this.http.post<ChronicConditionResponse>(this.base, req);
  }

  update(id: number, req: ChronicConditionRequest): Observable<ChronicConditionResponse> {
    return this.http.put<ChronicConditionResponse>(`${this.base}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getByDoctor(doctorId: number): Observable<ChronicConditionResponse[]> {
    return this.http.get<ChronicConditionResponse[]>(`${this.base}/doctor/${doctorId}`);
  }

  getByPatient(patientId: number): Observable<ChronicConditionResponse[]> {
    return this.http.get<ChronicConditionResponse[]>(`${this.base}/patient/${patientId}`);
  }

  getCritical(doctorId: number): Observable<ChronicConditionResponse[]> {
    return this.http.get<ChronicConditionResponse[]>(`${this.base}/doctor/${doctorId}/critical`);
  }

  checkSeverity(req: Partial<ChronicConditionRequest>): Observable<string> {
    return this.http.post<string>(`${this.base}/check-severity`, req, { responseType: 'text' as any });
  }
}
