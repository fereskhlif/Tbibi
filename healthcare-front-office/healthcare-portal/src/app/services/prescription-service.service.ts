import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type PrescriptionStatus = 'PENDING' | 'VALIDATED' | 'DISPENSED' | 'COMPLETED' | 'CANCELLED';
export interface ActeDTO {
  acteId: number;
  description: string;
  typeOfActe?: string;
  date?: string;
  patientId?: number;
  patientName?: string;
  doctorId?: number;
  doctorName?: string;
}

export interface PatientDTO {
  patientId: number;
  patientName: string;
}

export interface ActeCreateRequest {
  date: string;
  description: string;
  typeOfActe: string;
}
export interface MedicineDTO {
  medicineId: number;
  medicineName: string;
  quantity: number;
}

export interface PrescriptionResponse {
  acteId?: number;
  acteType?: string;  // typeOfActe of the linked Acte (e.g. ANALYSE_DIAGNOSTIQUE)
patientId?: number;
patientName?: string;
patientEmail?: string;
  doctorId?: number;
  doctorName?: string;
  prescriptionID: number;
  medicines: MedicineDTO[];
  date: string;
  expirationDate?: string;
  note: string;
  status: PrescriptionStatus;
  statusUpdatedAt: string;
  // UI helpers (not from backend)
  expanded?: boolean;
}

export interface PrescriptionRequest {
  note: string;
  date: string;
  expirationDate?: string;
  status?: PrescriptionStatus;
}

export interface PatientReportDTO {
  patientId: number;
  patientName: string;
  patientEmail: string;
  totalPrescriptions: number;
  activePrescriptions: number;
  expiredPrescriptions: number;
  cancelledPrescriptions: number;
  pendingPrescriptions: number;
  dispensedPrescriptions: number;
  totalMedicinesEverPrescribed: number;
  uniqueMedicinesCount: number;
  topMedicines: {
    medicineName: string;
    activeIngredient?: string;
    count: number;
  }[];
  prescriptions: PrescriptionResponse[];
  prescriptionsPerMonth: Record<string, number>;
}

export const STATUS_META: Record<PrescriptionStatus, {
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  step: number;
}> = {
  PENDING:   { label: 'En attente',  icon: '⏳', color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', step: 0 },
  VALIDATED: { label: 'Validée',     icon: '✅', color: '#3b82f6', bg: '#dbeafe', border: '#bfdbfe', step: 1 },
  DISPENSED: { label: 'Délivrée',    icon: '💊', color: '#8b5cf6', bg: '#ede9fe', border: '#ddd6fe', step: 2 },
  COMPLETED: { label: 'Terminée',    icon: '🎉', color: '#10b981', bg: '#d1fae5', border: '#a7f3d0', step: 3 },
  CANCELLED: { label: 'Annulée',     icon: '❌', color: '#ef4444', bg: '#fee2e2', border: '#fecaca', step: -1 },
};

@Injectable({ providedIn: 'root' })
export class PrescriptionService {

  private apiUrl = `${environment.baseUrl}/prescriptions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PrescriptionResponse[]> {
    return this.http.get<PrescriptionResponse[]>(`${this.apiUrl}/all`);
  }

  /** Returns only the prescriptions for the currently authenticated patient (enriched with doctor info). */
  getMyPrescriptions(): Observable<PrescriptionResponse[]> {
    return this.http.get<PrescriptionResponse[]>(`${this.apiUrl}/my`);
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

  updateStatus(id: number, status: PrescriptionStatus): Observable<PrescriptionResponse> {
    return this.http.patch<PrescriptionResponse>(`${this.apiUrl}/${id}/status`, { status });
  }

  renewPrescription(id: number): Observable<PrescriptionResponse> {
    return this.http.post<PrescriptionResponse>(`${this.apiUrl}/${id}/renew`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
  assignActe(prescriptionId: number, acteId: number): Observable<PrescriptionResponse> {
  return this.http.patch<PrescriptionResponse>(
    `${this.apiUrl}/${prescriptionId}/assign-acte`,
    { acteId }
  );
}

getAllActes(): Observable<ActeDTO[]> {
  return this.http.get<ActeDTO[]>(`${environment.baseUrl}/actes/all`);
}

  /** Returns only the actes for the currently authenticated patient (enriched with doctor info). */
  getMyActes(): Observable<ActeDTO[]> {
    return this.http.get<ActeDTO[]>(`${environment.baseUrl}/actes/my`);
  }

  /** Returns all patients (PATIENT role) for the doctor's dropdown. */
  getAllPatients(): Observable<PatientDTO[]> {
    return this.http.get<PatientDTO[]>(`${environment.baseUrl}/actes/patients`);
  }

  /** Creates a new acte linked to the selected patient. */
  addActeForPatient(patientId: number, acte: ActeCreateRequest): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrl}/actes/add-for-patient/${patientId}`,
      acte
    );
  }

  /** Returns prescriptions linked to an acte with analysis type (for laboratory). */
  getAnalysisPrescriptions(): Observable<PrescriptionResponse[]> {
    return this.http.get<PrescriptionResponse[]>(`${this.apiUrl}/analysis`);
  }

  /** Checks for AI substitutes if a medicine is out of stock. */
  checkSubstitutes(req: { medicineName: string; patientId: number; indication: string; famille?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/check-substitutes`, req);
  }

  /** Gets AI suggestion for therapeutic class based on patient record and indication */
  predictTherapeuticClass(req: { patientId: number; indication: string; weight?: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ai-predict`, req);
  }

  getPrescription(id: number): Observable<PrescriptionResponse> {
    return this.http.get<PrescriptionResponse>(`${this.apiUrl}/get/${id}`);
  }

  getPatientReport(patientId: number): Observable<PatientReportDTO> {
    return this.http.get<PatientReportDTO>(`${this.apiUrl}/patient/${patientId}/report`);
  }

  syncAi(): Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/api/medicines/sync-ai`, {});
  }
}