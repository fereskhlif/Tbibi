import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordsServiceService {

  constructor(private http: HttpClient) {}

  // ── Public API ────────────────────────────────────────────────────────────

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.baseUrl}/medical-records/getAll`,
    //  { headers: this.authHeaders() }
    );
  }

  /**
   * Sends JSON body  →  matches backend @RequestBody MdicalReccordsRequest
   * The image is stored as base64 string inside the JSON (field: imageUrl)
   */
  add(data: any): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrl}/medical-records/add`,
      data,
      { headers: this.authHeaders() }
    );
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(
      `${environment.baseUrl}/medical-records/${id}`,
      data,
      { headers: this.authHeaders() }
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.baseUrl}/medical-records/${id}`,
      { headers: this.authHeaders() }
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Reads the JWT from localStorage using the same key as AuthService.
   * Key: 'TokenUserConnect'  (value is JSON-stringified → needs JSON.parse)
   */
  private getToken(): string | null {
    const raw = localStorage.getItem('TokenUserConnect');
    // Le token est stocké comme une string, pas comme du JSON
    return raw ? raw : null;
  }

  /** JSON + Bearer token headers */
  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });
  }

  /**
   * Builds multipart/form-data.
   * Field names match Spring @RequestParam names on the backend.
   */
  private buildFormData(data: any, imageFile?: File | null, pdfFile?: File | null): FormData {
    const fd = new FormData();

    if (data.imageLabo        != null) fd.append('imageLabo',        data.imageLabo);
    if (data.result_ia        != null) fd.append('result_ia',        data.result_ia);
    if (data.medical_historuy != null) fd.append('medical_historuy', data.medical_historuy);
    if (data.chronic_diseas   != null) fd.append('chronic_diseas',   data.chronic_diseas);

    if (imageFile) fd.append('file',   imageFile, imageFile.name);
    if (pdfFile)   fd.append('repDoc', pdfFile,   pdfFile.name);

    return fd;
  }
}