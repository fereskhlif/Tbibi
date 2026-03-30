import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderLineResponse } from './order-line.service';

export interface OrderRequest {
    deliveryDate: string;
    orderDate: string;
    totalAmount: number;
    orderStatus: string;
    pharmacyId: number;
    userId: number;
    orderLineIds: number[];
}

export interface OrderResponse {
    orderId: number;
    deliveryDate: string;
    orderDate: string;
    totalAmount: number;
    orderStatus: string;
    pharmacyId: number;
    pharmacyName: string;
    userId: number;
    orderLines: OrderLineResponse[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
    private apiUrl = 'http://localhost:8089/api/orders';

    constructor(private http: HttpClient) { }

    getAll(): Observable<OrderResponse[]> {
        return this.http.get<OrderResponse[]>(this.apiUrl);
    }

    getById(id: number): Observable<OrderResponse> {
        return this.http.get<OrderResponse>(`${this.apiUrl}/${id}`);
    }

    create(request: OrderRequest): Observable<OrderResponse> {
        return this.http.post<OrderResponse>(this.apiUrl, request);
    }

    update(id: number, request: OrderRequest): Observable<OrderResponse> {
        return this.http.put<OrderResponse>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
