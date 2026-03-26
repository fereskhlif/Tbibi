import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicine } from '../models/medicine.model';
import { Pharmacy } from '../models/pharmacy.model';

@Injectable({ providedIn: 'root' })
export class PatientMedicineService {
    private apiUrl = 'http://localhost:8088/api/medicines';
    private pharmacyUrl = 'http://localhost:8088/api/pharmacies';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Medicine[]> {
        return this.http.get<Medicine[]>(this.apiUrl);
    }

    getByPharmacy(pharmacyId: number): Observable<Medicine[]> {
        return this.http.get<Medicine[]>(`${this.apiUrl}/pharmacy/${pharmacyId}`);
    }

    getById(id: number): Observable<Medicine> {
        return this.http.get<Medicine>(`${this.apiUrl}/${id}`);
    }

    searchByName(name: string): Observable<Medicine[]> {
        return this.http.get<Medicine[]>(`${this.apiUrl}/search?name=${name}`);
    }

    getPharmacies(): Observable<Pharmacy[]> {
        return this.http.get<Pharmacy[]>(this.pharmacyUrl);
    }
}
