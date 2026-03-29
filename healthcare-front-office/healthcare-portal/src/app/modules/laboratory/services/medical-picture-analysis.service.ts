import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalPictureAnalysisRequest, MedicalPictureAnalysisResponse } from '../models/medical-picture-analysis.model';

@Injectable({
  providedIn: 'root'
})
export class MedicalPictureAnalysisService {
  private apiUrl = 'http://localhost:8088/api/medical-picture-analysis';

  constructor(private http: HttpClient) {}

  // ==================== CRUD DE BASE ====================

  getAll(): Observable<MedicalPictureAnalysisResponse[]> {
    return this.http.get<MedicalPictureAnalysisResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<MedicalPictureAnalysisResponse> {
    return this.http.get<MedicalPictureAnalysisResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: MedicalPictureAnalysisRequest): Observable<MedicalPictureAnalysisResponse> {
    return this.http.post<MedicalPictureAnalysisResponse>(this.apiUrl, request);
  }

  update(id: number, request: MedicalPictureAnalysisRequest): Observable<MedicalPictureAnalysisResponse> {
    return this.http.put<MedicalPictureAnalysisResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  // ==================== ENDPOINTS AVANCÉS ====================

  // ✅ Upload image + analyse IA — multipart/form-data
  createWithImage(request: MedicalPictureAnalysisRequest, imageFile: File): Observable<MedicalPictureAnalysisResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    return this.http.post<MedicalPictureAnalysisResponse>(`${this.apiUrl}/upload`, formData);
  }

  // ✅ Valider une analyse
  validateAnalysis(id: number, doctorNote: string): Observable<MedicalPictureAnalysisResponse> {
    return this.http.put<MedicalPictureAnalysisResponse>(
      `${this.apiUrl}/${id}/validate?doctorNote=${encodeURIComponent(doctorNote)}`, {}
    );
  }

  // ✅ Filtrer par statut
  getByStatus(status: string): Observable<MedicalPictureAnalysisResponse[]> {
    return this.http.get<MedicalPictureAnalysisResponse[]>(`${this.apiUrl}/status/${status}`);
  }

  // ✅ Filtrer par catégorie
  getByCategory(category: string): Observable<MedicalPictureAnalysisResponse[]> {
    return this.http.get<MedicalPictureAnalysisResponse[]>(`${this.apiUrl}/category/${category}`);
  }
}