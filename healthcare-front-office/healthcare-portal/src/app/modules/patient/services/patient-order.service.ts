import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRequest, OrderResponse } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class PatientOrderService {
    private apiUrl = 'http://localhost:8088/api/orders';

    constructor(private http: HttpClient) { }

    placeOrder(request: OrderRequest): Observable<OrderResponse> {
        return this.http.post<OrderResponse>(this.apiUrl, request);
    }

    getOrdersByUser(userId: number): Observable<OrderResponse[]> {
        return this.http.get<OrderResponse[]>(`${this.apiUrl}/user/${userId}`);
    }

    getOrderDetails(id: number): Observable<OrderResponse> {
        return this.http.get<OrderResponse>(`${this.apiUrl}/${id}`);
    }

    cancelOrder(id: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/status?status=CANCELLED`, {});
    }
}
