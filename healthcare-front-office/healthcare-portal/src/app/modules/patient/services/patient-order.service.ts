import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRequest, OrderResponse } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class PatientOrderService {
    private apiUrl = 'http://localhost:8088/api/orders';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        let token = localStorage.getItem('TokenUserConnect');
        if (token && token.startsWith('"') && token.endsWith('"')) {
            token = token.slice(1, -1);
        }
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    placeOrder(request: OrderRequest): Observable<OrderResponse> {
        return this.http.post<OrderResponse>(this.apiUrl, request, { headers: this.getHeaders() });
    }

    getOrdersByUser(userId: number): Observable<OrderResponse[]> {
        return this.http.get<OrderResponse[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getHeaders() });
    }

    getOrderDetails(id: number): Observable<OrderResponse> {
        return this.http.get<OrderResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    cancelOrder(id: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/status?status=CANCELLED`, {}, { headers: this.getHeaders() });
    }

    getUserOrdersPaginated(
        userId: number,
        status: string,
        search: string,
        sortType: string,
        page: number,
        size: number
    ): Observable<Page<OrderResponse>> {
        let params = `?page=${page}&size=${size}`;
        if (status && status !== 'ALL') params += `&status=${status}`;
        if (search) params += `&search=${encodeURIComponent(search)}`;
        if (sortType) params += `&sortType=${sortType}`;

        return this.http.get<Page<OrderResponse>>(`${this.apiUrl}/user/${userId}/paged${params}`, { headers: this.getHeaders() });
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
