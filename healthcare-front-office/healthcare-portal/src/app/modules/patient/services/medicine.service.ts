import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MedicineRequest {
    medicineName: string;
    quantity: number;
    dateOfExpiration: string;
    price: number;
    stock: number;
}

export interface MedicineResponse {
    medicineId: number;
    medicineName: string;
    quantity: number;
    dateOfExpiration: string;
    price: number;
    stock: number;
}

@Injectable({ providedIn: 'root' })
export class MedicineService {
    private apiUrl = 'http://localhost:8089/api/medicines';

    constructor(private http: HttpClient) { }

    getAll(): Observable<MedicineResponse[]> {
        return this.http.get<MedicineResponse[]>(this.apiUrl);
    }

    getById(id: number): Observable<MedicineResponse> {
        return this.http.get<MedicineResponse>(`${this.apiUrl}/${id}`);
    }

    create(request: MedicineRequest): Observable<MedicineResponse> {
        return this.http.post<MedicineResponse>(this.apiUrl, request);
    }

    update(id: number, request: MedicineRequest): Observable<MedicineResponse> {
        return this.http.put<MedicineResponse>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
