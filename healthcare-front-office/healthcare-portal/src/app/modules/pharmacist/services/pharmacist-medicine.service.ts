import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { Medicine, MedicineUpdateRequest } from '../models/medicine.model';

@Injectable({ providedIn: 'root' })
export class PharmacistMedicineService {
    private apiUrl = 'http://localhost:8088/api/medicines';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Medicine[]> {
        return this.http.get<Medicine[]>(this.apiUrl);
    }

    getById(id: number): Observable<Medicine> {
        return this.http.get<Medicine>(`${this.apiUrl}/${id}`);
    }

    /** Create medicine with at least one image (backend requires images) via multipart/form-data */
    create(medicineData: MedicineUpdateRequest, images: File[]): Observable<Medicine> {
        const formData = new FormData();
        formData.append('medicine', new Blob([JSON.stringify(medicineData)], { type: 'application/json' }));
        // Backend requires at least one image (required = true)
        images.forEach(file => formData.append('images', file));
        return this.http.post<Medicine>(this.apiUrl, formData);
    }

    /** Update medicine info via JSON */
    update(id: number, data: MedicineUpdateRequest): Observable<Medicine> {
        return this.http.put<Medicine>(`${this.apiUrl}/${id}`, data);
    }

    /** Soft delete (sets available=false) */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    searchByName(name: string): Observable<Medicine[]> {
        return this.http.get<Medicine[]>(`${this.apiUrl}/search`, { params: { name } });
    }

    getLowStock(): Observable<Medicine[]> {
        return this.http.get<Medicine[]>(`${this.apiUrl}/low-stock`);
    }

    getExpired(): Observable<Medicine[]> {
        return this.http.get<Medicine[]>(`${this.apiUrl}/expired`);
    }

    /** Add a single image to an existing medicine — backend accepts one image at a time with key 'image' */
    addImage(id: number, image: File): Observable<Medicine> {
        const formData = new FormData();
        formData.append('image', image);
        return this.http.post<Medicine>(`${this.apiUrl}/${id}/images`, formData);
    }

    /** Add multiple images sequentially (one request per file) using forkJoin */
    addImages(id: number, images: File[]): Observable<Medicine> {
        if (images.length === 0) {
            return new Observable<Medicine>((obs) => obs.error('No images selected'));
        }
        const requests = images.map(file => this.addImage(id, file));
        // Return the last result (most complete medicine state)
        return new Observable<Medicine>((observer) => {
            forkJoin(requests).subscribe({
                next: (results: Medicine[]) => observer.next(results[results.length - 1]),
                error: (err: any) => observer.error(err),
                complete: () => observer.complete()
            });
        });
    }

    /** Remove a single image from a medicine */
    deleteImage(id: number, imageUrl: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}/images`, {
            params: { imageUrl }
        });
    }
}
