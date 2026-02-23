import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MedicineDTO {
  medicineId: number;
  medicineName: string;
  quantity: number;
}

export interface PrescriptionResponse {
  prescriptionID: number;
  medicines: MedicineDTO[];
  date: string;
  note: string;
  expanded?: boolean;
}

export interface PrescriptionRequest {
  note: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {

  private apiUrl = `${environment.baseUrl}/prescriptions`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<PrescriptionResponse[]> {
    return this.http.get<PrescriptionResponse[]>(`${this.apiUrl}/all`);
  }

  getById(id: number): Observable<PrescriptionResponse> {
    return this.http.get<PrescriptionResponse>(`${this.apiUrl}/get/${id}`);
  }

  add(prescription: PrescriptionRequest): Observable<PrescriptionResponse> {
    return this.http.post<PrescriptionResponse>(`${this.apiUrl}/add`, prescription);
  }

  update(id: number, prescription: PrescriptionRequest): Observable<PrescriptionResponse> {
    return this.http.put<PrescriptionResponse>(`${this.apiUrl}/update/${id}`, prescription);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}