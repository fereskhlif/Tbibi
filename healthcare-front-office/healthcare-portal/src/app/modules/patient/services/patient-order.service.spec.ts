import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientOrderService } from './patient-order.service';
import { OrderRequest, OrderResponse } from '../models/order.model';

describe('PatientOrderService', () => {
    let service: PatientOrderService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:8088/api/orders';

    const mockOrder: OrderResponse = {
        orderId: 1, orderDate: '2024-01-15', deliveryDate: null,
        totalAmount: 15.98, orderStatus: 'PENDING', pharmacyId: 1,
        pharmacyName: 'Central Pharmacy', userId: 3, userName: 'John',
        orderLines: [
            { lineId: 1, medicineId: 1, medicineName: 'Aspirin', quantity: 2, unitPrice: 5.99 },
            { lineId: 2, medicineId: 2, medicineName: 'Ibuprofen', quantity: 1, unitPrice: 4.00 }
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PatientOrderService]
        });
        service = TestBed.inject(PatientOrderService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('placeOrder', () => {

        it('should place order via POST', () => {
            const request: OrderRequest = {
                userId: 3, pharmacyId: 1,
                orderLines: [{ medicineId: 1, quantity: 2 }]
            };
            service.placeOrder(request).subscribe(order => {
                expect(order.orderId).toBe(1);
                expect(order.orderStatus).toBe('PENDING');
            });
            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(request);
            req.flush(mockOrder);
        });

        it('should handle order placement error', () => {
            const request: OrderRequest = {
                userId: 3, pharmacyId: 1,
                orderLines: [{ medicineId: 999, quantity: 100 }]
            };
            service.placeOrder(request).subscribe({
                next: () => fail('Should have failed'),
                error: (err) => expect(err.status).toBe(400)
            });
            const req = httpMock.expectOne(apiUrl);
            req.flush('Not enough stock', { status: 400, statusText: 'Bad Request' });
        });
    });

    describe('getOrdersByUser', () => {

        it('should fetch orders for user', () => {
            service.getOrdersByUser(3).subscribe(orders => {
                expect(orders.length).toBe(1);
                expect(orders[0].userId).toBe(3);
            });
            const req = httpMock.expectOne(`${apiUrl}/user/3`);
            expect(req.request.method).toBe('GET');
            req.flush([mockOrder]);
        });

        it('should return empty array when no orders', () => {
            service.getOrdersByUser(999).subscribe(orders => {
                expect(orders.length).toBe(0);
            });
            const req = httpMock.expectOne(`${apiUrl}/user/999`);
            req.flush([]);
        });
    });

    describe('getOrderDetails', () => {

        it('should fetch order details by ID', () => {
            service.getOrderDetails(1).subscribe(order => {
                expect(order.orderId).toBe(1);
                expect(order.orderLines.length).toBe(2);
            });
            const req = httpMock.expectOne(`${apiUrl}/1`);
            expect(req.request.method).toBe('GET');
            req.flush(mockOrder);
        });
    });

    describe('cancelOrder', () => {

        it('should cancel order via PUT', () => {
            service.cancelOrder(1).subscribe();
            const req = httpMock.expectOne(`${apiUrl}/1/status?status=CANCELLED`);
            expect(req.request.method).toBe('PUT');
            req.flush(null);
        });

        it('should handle cancel error', () => {
            service.cancelOrder(999).subscribe({
                next: () => fail('Should have failed'),
                error: (err) => expect(err.status).toBe(404)
            });
            const req = httpMock.expectOne(`${apiUrl}/999/status?status=CANCELLED`);
            req.flush('Not Found', { status: 404, statusText: 'Not Found' });
        });
    });
});