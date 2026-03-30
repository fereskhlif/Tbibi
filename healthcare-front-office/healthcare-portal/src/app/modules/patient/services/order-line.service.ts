import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderLineRequest {
    quantity: number;
    unitPrice: number;
    medicineId: number;
}

export interface OrderLineResponse {
    lineId: number;
    quantity: number;
    unitPrice: number;
    medicineId: number;
    medicineName: string;
}

@Injectable({ providedIn: 'root' })
export class OrderLineService {
    private apiUrl = 'http://localhost:8089/api/orderlines';

    constructor(private http: HttpClient) { }

    getAll(): Observable<OrderLineResponse[]> {
        return this.http.get<OrderLineResponse[]>(this.apiUrl);
    }

    getById(id: number): Observable<OrderLineResponse> {
        return this.http.get<OrderLineResponse>(`${this.apiUrl}/${id}`);
    }

    create(request: OrderLineRequest): Observable<OrderLineResponse> {
        return this.http.post<OrderLineResponse>(this.apiUrl, request);
    }

    update(id: number, request: OrderLineRequest): Observable<OrderLineResponse> {
        return this.http.put<OrderLineResponse>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
