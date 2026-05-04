import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { PatientEvaluation, PatientEvaluationRequest } from '../models/patient-evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class PatientEvaluationService {
  private apiUrl = `${environment.baseUrl}/api/patient-evaluation`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PatientEvaluation[]> {
    return this.http.get<PatientEvaluation[]>(this.apiUrl);
  }

  getById(id: number): Observable<PatientEvaluation> {
    return this.http.get<PatientEvaluation>(`${this.apiUrl}/${id}`);
  }

  getByPatient(patientId: number): Observable<PatientEvaluation[]> {
    return this.http.get<PatientEvaluation[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getByPhysiotherapist(physiotherapistId: number): Observable<PatientEvaluation[]> {
    return this.http.get<PatientEvaluation[]>(`${this.apiUrl}/physiotherapist/${physiotherapistId}`);
  }

  create(request: PatientEvaluationRequest): Observable<PatientEvaluation> {
    return this.http.post<PatientEvaluation>(this.apiUrl, request);
  }

  update(id: number, request: PatientEvaluationRequest): Observable<PatientEvaluation> {
    return this.http.put<PatientEvaluation>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }
}
