import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MedicineRequest {
  medicineName: string;
  dosage: string;
  description: string;
  form: string;
  activeIngredient: string; // ← ADD
  price: number;
  stock: number;
  minStockAlert: number;
  pharmacyId: number;
}

@Injectable({
  providedIn: 'root'
})
export class MedicineService {

  private apiUrl = 'http://localhost:8088/api/medicines'; // ← FIX PORT

  constructor(private http: HttpClient) { }

  createMedicine(data: MedicineRequest, image: string): Observable<any> {
    const formData = new FormData();
    formData.append('request', new Blob(
      [JSON.stringify(data)],
      { type: 'application/json' }
    ));
    if (image) {
      const imageFile = this.base64ToFile(image, 'medicine.png');
      formData.append('images', imageFile);
    }
    return this.http.post(this.apiUrl, formData);
  }

  private base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = 'image/png';
    const bstr = atob(arr.length > 1 ? arr[1] : arr[0]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  searchByName(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params: { name } });
  }
}