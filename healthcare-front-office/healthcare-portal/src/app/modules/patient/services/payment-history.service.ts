import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentHistoryRequest {
    amount: number;
}

export interface PaymentHistoryResponse {
    historyId: number;
    amount: number;
    paymentIds: number[];
}

@Injectable({ providedIn: 'root' })
export class PaymentHistoryService {
    private apiUrl = 'http://localhost:8089/api/payment-histories';

    constructor(private http: HttpClient) { }

    getAll(): Observable<PaymentHistoryResponse[]> {
        return this.http.get<PaymentHistoryResponse[]>(this.apiUrl);
    }

    getById(id: number): Observable<PaymentHistoryResponse> {
        return this.http.get<PaymentHistoryResponse>(`${this.apiUrl}/${id}`);
    }

    create(request: PaymentHistoryRequest): Observable<PaymentHistoryResponse> {
        return this.http.post<PaymentHistoryResponse>(this.apiUrl, request);
    }

    update(id: number, request: PaymentHistoryRequest): Observable<PaymentHistoryResponse> {
        return this.http.put<PaymentHistoryResponse>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
