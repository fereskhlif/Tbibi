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

  getById(id: number): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}/medical-records/${id}`
    );
  }

  /**
   * Sends JSON body  →  matches backend @RequestBody MdicalReccordsRequest
   * The image is stored as base64 string inside the JSON (field: imageUrl)
   */
  add(data: any): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrl}/medical-records/add`,
      data
    );
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(
      `${environment.baseUrl}/medical-records/${id}`,
      data
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(
      `${environment.baseUrl}/medical-records/${id}`,
      { responseType: 'text' }
    );
  }

  // ── Patient self-service methods ──────────────────────────────────────────

  getMyRecord(): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}/medical-records/my`
    );
  }

  uploadPatientImage(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file, file.name);

    return this.http.post<any>(
      `${environment.baseUrl}/medical-records/my/upload-image`,
      fd
    );
  }

  updateMyRecord(data: any): Observable<any> {
    return this.http.put<any>(
      `${environment.baseUrl}/medical-records/my`,
      data
    );
  }

  deletePatientImage(imagePath: string): Observable<any> {
    return this.http.delete<any>(
      `${environment.baseUrl}/medical-records/my/image`,
      { 
        params: { path: imagePath }
      }
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

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