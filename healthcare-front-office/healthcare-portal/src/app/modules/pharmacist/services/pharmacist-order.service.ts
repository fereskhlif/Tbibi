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

    getOrdersByPharmacyAndUserEmail(pharmacyId: number, email: string): Observable<PharmacistOrder[]> {
        return this.http.get<PharmacistOrder[]>(`${this.apiUrl}/pharmacy/${pharmacyId}/user/${email}`);
    }

    getOrdersPaginated(
        pharmacyId: number,
        status: string,
        search: string,
        sortType: string,
        page: number,
        size: number
    ): Observable<Page<PharmacistOrder>> {
        let params = `?page=${page}&size=${size}`;
        if (status && status !== 'ALL') params += `&status=${status}`;
        if (search) params += `&search=${encodeURIComponent(search)}`;
        if (sortType) params += `&sortType=${sortType}`;

        return this.http.get<Page<PharmacistOrder>>(`${this.apiUrl}/pharmacy/${pharmacyId}/paged${params}`);
    }
}

export interface Page<T> {
    content: T[];
    pageable: any;
    last: boolean;
    totalElements: number;
    totalPages: number;
    first: boolean;
    size: number;
    number: number;
    sort: any;
    numberOfElements: number;
    empty: boolean;
}
