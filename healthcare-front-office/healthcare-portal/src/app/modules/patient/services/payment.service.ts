import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentRequest {
    paymentDate: string;
    paymentMethod: string;
    paymentHistoryId: number;
    userId: number;
}

export interface PaymentResponse {
    paymentId: number;
    paymentDate: string;
    paymentMethod: string;
    paymentHistoryId: number;
    userId: number;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
    private apiUrl = 'http://localhost:8089/api/payments';

    constructor(private http: HttpClient) { }

    getAll(): Observable<PaymentResponse[]> {
        return this.http.get<PaymentResponse[]>(this.apiUrl);
    }

    getById(id: number): Observable<PaymentResponse> {
        return this.http.get<PaymentResponse>(`${this.apiUrl}/${id}`);
    }

    create(request: PaymentRequest): Observable<PaymentResponse> {
        return this.http.post<PaymentResponse>(this.apiUrl, request);
    }

    update(id: number, request: PaymentRequest): Observable<PaymentResponse> {
        return this.http.put<PaymentResponse>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
