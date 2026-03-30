import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { MedicineResponse, MedicineService } from './medicine.service';

export interface CartItem {
    medicineId: number;
    medicineName: string;
    price: number;
    quantity: number;
    stock: number;
    dateOfExpiration: string;
}

export interface PharmacyResponse {
    pharmacyId: number;
    pharmacyName: string;
    pharmacyAddress: string;
    orderIds: number[];
}

export interface PharmacyRequest {
    pharmacyName: string;
    pharmacyAddress: string;
}

@Injectable({ providedIn: 'root' })
export class PharmacyService {
    private pharmacyApiUrl = 'http://localhost:8089/api/pharmacies';

    private cartItems = new BehaviorSubject<CartItem[]>([]);
    cartItems$ = this.cartItems.asObservable();

    constructor(
        private http: HttpClient,
        private medicineService: MedicineService
    ) { }

    // Pharmacy CRUD
    getAllPharmacies(): Observable<PharmacyResponse[]> {
        return this.http.get<PharmacyResponse[]>(this.pharmacyApiUrl);
    }

    getPharmacyById(id: number): Observable<PharmacyResponse> {
        return this.http.get<PharmacyResponse>(`${this.pharmacyApiUrl}/${id}`);
    }

    createPharmacy(request: PharmacyRequest): Observable<PharmacyResponse> {
        return this.http.post<PharmacyResponse>(this.pharmacyApiUrl, request);
    }

    updatePharmacy(id: number, request: PharmacyRequest): Observable<PharmacyResponse> {
        return this.http.put<PharmacyResponse>(`${this.pharmacyApiUrl}/${id}`, request);
    }

    deletePharmacy(id: number): Observable<void> {
        return this.http.delete<void>(`${this.pharmacyApiUrl}/${id}`);
    }

    // Medicines (delegate to MedicineService)
    getMedicines(): Observable<MedicineResponse[]> {
        return this.medicineService.getAll();
    }

    getMedicine(id: number): Observable<MedicineResponse> {
        return this.medicineService.getById(id);
    }

    // Cart management
    addToCart(medicine: MedicineResponse, qty: number = 1) {
        const currentCart = this.cartItems.value;
        const existing = currentCart.find(i => i.medicineId === medicine.medicineId);
        if (existing) {
            existing.quantity += qty;
        } else {
            currentCart.push({
                medicineId: medicine.medicineId,
                medicineName: medicine.medicineName,
                price: medicine.price,
                quantity: qty,
                stock: medicine.stock,
                dateOfExpiration: medicine.dateOfExpiration
            });
        }
        this.cartItems.next([...currentCart]);
    }

    removeFromCart(medicineId: number) {
        const currentCart = this.cartItems.value.filter(i => i.medicineId !== medicineId);
        this.cartItems.next([...currentCart]);
    }

    clearCart() {
        this.cartItems.next([]);
    }

    getCartTotal() {
        return this.cartItems.value.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }

    getCartCount() {
        return this.cartItems.value.reduce((acc, item) => acc + item.quantity, 0);
    }
}
