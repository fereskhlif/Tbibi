import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicine, Page } from '../models/medicine.model';
import { Pharmacy } from '../models/pharmacy.model';

@Injectable({ providedIn: 'root' })
export class PatientMedicineService {
    private apiUrl = 'http://localhost:8088/api/medicines';
    private pharmacyUrl = 'http://localhost:8088/api/pharmacies';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Medicine[]> {
        return this.http.get<Medicine[]>(this.apiUrl);
    }

    getAllPaginated(page: number, size: number, sort: string = 'medicineName,asc'): Observable<Page<Medicine>> {
        return this.http.get<Page<Medicine>>(`${this.apiUrl}/paginated`, { params: { page, size, sort } });
    }

    getByPharmacy(pharmacyId: number): Observable<Medicine[]> {
        return this.http.get<Medicine[]>(`${this.apiUrl}/pharmacy/${pharmacyId}`);
    }

    getByPharmacyPaginated(pharmacyId: number, page: number, size: number): Observable<Page<Medicine>> {
        return this.http.get<Page<Medicine>>(`${this.apiUrl}/pharmacy/${pharmacyId}/paginated`, { params: { page, size } });
    }

    getById(id: number): Observable<Medicine> {
        return this.http.get<Medicine>(`${this.apiUrl}/${id}`);
    }

    searchByName(name: string): Observable<Medicine[]> {
        return this.http.get<Medicine[]>(`${this.apiUrl}/search?name=${name}`);
    }

    searchPaginated(name: string, pharmacyId: number | null, page: number, size: number, sort: string = 'medicineName,asc'): Observable<Page<Medicine>> {
        const params: any = { name, page, size, sort };
        if (pharmacyId) params.pharmacyId = pharmacyId;
        return this.http.get<Page<Medicine>>(`${this.apiUrl}/search/paginated`, { params });
    }

    getPharmacies(): Observable<Pharmacy[]> {
        return this.http.get<Pharmacy[]>(this.pharmacyUrl);
    }
}
