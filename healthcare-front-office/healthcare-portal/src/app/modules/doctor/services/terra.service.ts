import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

const API = 'http://localhost:8088/api/terra';

export interface TerraVitals {
  patientId: number;
  deviceConnected: boolean;
  provider: string | null;
  heartRate: number | null;
  oxygenSaturation: number | null;
  bloodSugar: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  lastUpdated: string | null;
  statusMessage: string | null;
}

export interface TerraWidget {
  url: string | null;
  sessionId: string | null;
  alreadyConnected: boolean;
  provider: string | null;
}

@Injectable({ providedIn: 'root' })
export class TerraService {
  constructor(private http: HttpClient) {}

  /** Get latest vitals for a patient (call every 3s during monitoring) */
  getVitals(patientId: number): Observable<TerraVitals> {
    return this.http.get<TerraVitals>(`${API}/vitals/${patientId}`).pipe(
      catchError(() => of({
        patientId,
        deviceConnected: false,
        provider: null,
        heartRate: null,
        oxygenSaturation: null,
        bloodSugar: null,
        bloodPressureSystolic: null,
        bloodPressureDiastolic: null,
        lastUpdated: null,
        statusMessage: 'Could not reach the smartwatch API'
      }))
    );
  }

  /** Check if patient has a connected device */
  getStatus(patientId: number): Observable<{ connected: boolean; provider?: string }> {
    return this.http.get<any>(`${API}/status/${patientId}`).pipe(
      catchError(() => of({ connected: false }))
    );
  }

  /** Generate Terra widget URL so the patient can connect their device */
  connectDevice(patientId: number): Observable<TerraWidget> {
    return this.http.post<TerraWidget>(`${API}/connect/${patientId}`, {});
  }

  /** Remove the patient's Terra device connection */
  disconnectDevice(patientId: number): Observable<void> {
    return this.http.delete<void>(`${API}/disconnect/${patientId}`);
  }
}
