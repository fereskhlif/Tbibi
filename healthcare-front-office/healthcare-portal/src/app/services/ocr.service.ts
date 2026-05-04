import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  private apiUrl = 'https://app-backend-fbc4d6ghfwfwbwhv.austriaeast-01.azurewebsites.net/api/ocr/scan';

  constructor(private http: HttpClient) { }

  scanMedicine(file: File): Observable<MedicineOcrResult> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<MedicineOcrResult>(this.apiUrl, formData);
  }
}
