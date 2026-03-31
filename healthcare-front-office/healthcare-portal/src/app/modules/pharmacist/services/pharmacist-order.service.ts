import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PharmacistOrder, OrderStatus } from '../models/pharmacist-order.model';

@Injectable({ providedIn: 'root' })
export class PharmacistOrderService {
    private apiUrl = 'http://localhost:8088/api/orders';

    constructor(private http: HttpClient) { }

    getOrdersByPharmacy(pharmacyId: number): Observable<PharmacistOrder[]> {
        return this.http.get<PharmacistOrder[]>(`${this.apiUrl}/pharmacy/${pharmacyId}`);
    }

    getOrdersByStatus(pharmacyId: number, status: OrderStatus): Observable<PharmacistOrder[]> {
        return this.http.get<PharmacistOrder[]>(`${this.apiUrl}/pharmacy/${pharmacyId}/status?status=${status}`);
    }

    getOrderById(id: number): Observable<PharmacistOrder> {
        return this.http.get<PharmacistOrder>(`${this.apiUrl}/${id}`);
    }

    updateOrderStatus(id: number, status: OrderStatus): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/status?status=${status}`, {});
    }
}
