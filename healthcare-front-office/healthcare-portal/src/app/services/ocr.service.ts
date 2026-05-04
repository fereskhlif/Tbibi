import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface MedicineOcrResult {
  medicineName: string;
  dosage: string;
  description: string;
  form: string;
  activeIngredient: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OcrService {

  private apiUrl = `${environment.baseUrl}/api/ocr/scan`;

  constructor(private http: HttpClient) { }

  scanMedicine(file: File): Observable<MedicineOcrResult> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<MedicineOcrResult>(this.apiUrl, formData);
  }
}
