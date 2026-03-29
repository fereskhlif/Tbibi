import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { MyOrdersComponent } from './my-orders.component';
import { PatientOrderService } from '../../services/patient-order.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MainLayoutComponent } from '../../../../shared/layouts/main-layout/main-layout.component';
import { OrderResponse } from '../../models/order.model';

describe('MyOrdersComponent', () => {
    let component: MyOrdersComponent;
    let fixture: ComponentFixture<MyOrdersComponent>;
    let orderServiceSpy: jasmine.SpyObj<PatientOrderService>;

    const mockOrders: OrderResponse[] = [
        {
            orderId: 1, orderDate: '2024-01-15T10:00:00', deliveryDate: null,
            totalAmount: 15.98, orderStatus: 'PENDING', pharmacyId: 1,
            pharmacyName: 'Central Pharmacy', userId: 3, userName: 'John',
            orderLines: [
                { lineId: 1, medicineId: 1, medicineName: 'Aspirin', quantity: 2, unitPrice: 5.99 }
            ]
        },
        {
            orderId: 2, orderDate: '2024-01-10T10:00:00', deliveryDate: '2024-01-12',
            totalAmount: 8.50, orderStatus: 'DELIVERED', pharmacyId: 1,
            pharmacyName: 'Central Pharmacy', userId: 3, userName: 'John',
            orderLines: [
                { lineId: 2, medicineId: 2, medicineName: 'Ibuprofen', quantity: 1, unitPrice: 8.50 }
            ]
        }
    ];

    beforeEach(async () => {
        orderServiceSpy = jasmine.createSpyObj('PatientOrderService', [
            'getOrdersByUser', 'cancelOrder'
        ]);
        orderServiceSpy.getOrdersByUser.and.returnValue(of(mockOrders));
        orderServiceSpy.cancelOrder.and.returnValue(of(void 0));
        spyOn(MainLayoutComponent, 'showToast');

        await TestBed.configureTestingModule({
            declarations: [MyOrdersComponent],
            providers: [
                { provide: PatientOrderService, useValue: orderServiceSpy }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(MyOrdersComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // ── LOADING ──────────────────────────────────────────────────
    describe('Loading Orders', () => {

        it('should load orders on init', fakeAsync(() => {
            fixture.detectChanges();
            flush();
            expect(orderServiceSpy.getOrdersByUser).toHaveBeenCalledWith(3);
            expect(component.orders.length).toBe(2);
            expect(component.loading).toBe(false);
        }));

        it('should sort orders by date descending', fakeAsync(() => {
            fixture.detectChanges();
            flush();
            expect(component.orders[0].orderId).toBe(1); // Jan 15 before Jan 10
        }));

        it('should handle loading error', fakeAsync(() => {
            spyOn(console, 'error');
            orderServiceSpy.getOrdersByUser.and.returnValue(
                throwError(() => new Error('Failed'))
            );
            fixture.detectChanges();
            flush();
            expect(component.error).toBe('Failed to load your orders. Please try again.');
            expect(component.loading).toBe(false);
        }));
    });

    // ── ORDER DETAILS ────────────────────────────────────────────
    describe('Order Details', () => {

        it('should open order details', () => {
            component.viewDetails(mockOrders[0]);
            expect(component.selectedOrder).toEqual(mockOrders[0]);
        });

        it('should close order details', () => {
            component.selectedOrder = mockOrders[0];
            component.closeDetails();
            expect(component.selectedOrder).toBeNull();
        });
    });

    // ── CANCEL ORDER ─────────────────────────────────────────────
    describe('Cancel Order', () => {

        beforeEach(fakeAsync(() => {
            fixture.detectChanges();
            tick();
        }));

        it('should cancel order when confirmed', fakeAsync(() => {
            spyOn(window, 'confirm').and.returnValue(true);
            component.cancelOrder(1);
            flush();
            expect(orderServiceSpy.cancelOrder).toHaveBeenCalledWith(1);
            expect(component.cancellingOrderId).toBeNull();
        }));

        it('should not cancel when user declines', () => {
            spyOn(window, 'confirm').and.returnValue(false);
            component.cancelOrder(1);
            expect(orderServiceSpy.cancelOrder).not.toHaveBeenCalled();
        });

        it('should handle cancel error', fakeAsync(() => {
            spyOn(console, 'error');
            spyOn(window, 'confirm').and.returnValue(true);
            orderServiceSpy.cancelOrder.and.returnValue(
                throwError(() => new Error('Failed'))
            );
            component.cancelOrder(1);
            flush();
            expect(component.cancellingOrderId).toBeNull();
        }));
    });

    // ── STATUS CLASSES ───────────────────────────────────────────
    describe('getStatusClass', () => {

        it('should return yellow for PENDING', () => {
            const cls = component.getStatusClass('PENDING');
            expect(cls).toContain('yellow');
        });

        it('should return blue for CONFIRMED', () => {
            expect(component.getStatusClass('CONFIRMED')).toContain('blue');
        });

        it('should return emerald for DELIVERED', () => {
            expect(component.getStatusClass('DELIVERED')).toContain('emerald');
        });

        it('should return gray for CANCELLED', () => {
            expect(component.getStatusClass('CANCELLED')).toContain('gray');
        });

        it('should return red for REJECTED', () => {
            expect(component.getStatusClass('REJECTED')).toContain('red');
        });

        it('should return purple for IN_PROGRESS', () => {
            expect(component.getStatusClass('IN_PROGRESS')).toContain('purple');
        });

        it('should return gray for unknown status', () => {
            expect(component.getStatusClass('UNKNOWN')).toContain('gray');
        });
    });
});