import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartPageComponent } from './cart-page.component';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { Medicine } from '../../models/medicine.model';

describe('CartPageComponent', () => {
    let component: CartPageComponent;
    let fixture: ComponentFixture<CartPageComponent>;
    let cartServiceSpy: jasmine.SpyObj<CartService>;
    let routerSpy: jasmine.SpyObj<Router>;

    const mockMedicine: Medicine = {
        medicineId: 1, medicineName: 'Aspirin', description: 'Pain reliever',
        dosage: '500mg', price: 5.99, stock: 100, minStockAlert: 10,
        available: true, pharmacyId: 1, imageUrls: ['']
    };

    beforeEach(async () => {
        cartServiceSpy = jasmine.createSpyObj('CartService', [
            'getItemCount', 'getTotalAmount', 'getPharmacyId',
            'removeFromCart', 'updateQuantity', 'clearCart', 'getItems'
        ], {
            cartItems$: of([{ medicine: mockMedicine, quantity: 2 }])
        });
        cartServiceSpy.getItemCount.and.returnValue(2);
        cartServiceSpy.getTotalAmount.and.returnValue(11.98);
        cartServiceSpy.getPharmacyId.and.returnValue(1);

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [CartPageComponent],
            providers: [
                { provide: CartService, useValue: cartServiceSpy },
                { provide: Router, useValue: routerSpy }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(CartPageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getFirstImage', () => {

        it('should return first image URL', () => {
            const result = component.getFirstImage(mockMedicine);
            expect(result).toBe('');
        });

        it('should return placeholder when no images', () => {
            const noImageMed = { ...mockMedicine, imageUrls: [] };
            const result = component.getFirstImage(noImageMed);
            expect(result).toBe('assets/images/placeholder-medicine.png');
        });

        it('should return placeholder when imageUrls is null', () => {
            const nullImageMed = { ...mockMedicine, imageUrls: null as any };
            const result = component.getFirstImage(nullImageMed);
            expect(result).toBe('assets/images/placeholder-medicine.png');
        });
    });

    describe('Navigation', () => {

        it('should navigate to pharmacy medicines when continuing shopping', () => {
            component.continueShopping();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/patient/pharmacy', 1, 'medicines']);
        });

        it('should navigate to pharmacy list when no pharmacy ID', () => {
            cartServiceSpy.getPharmacyId.and.returnValue(0);
            component.continueShopping();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/patient/pharmacy-list']);
        });

        it('should navigate to checkout', () => {
            component.proceedToCheckout();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/patient/checkout']);
        });
    });

    describe('clearCart', () => {

        it('should clear cart when confirmed', () => {
            spyOn(window, 'confirm').and.returnValue(true);
            component.clearCart();
            expect(cartServiceSpy.clearCart).toHaveBeenCalled();
        });

        it('should not clear cart when cancelled', () => {
            spyOn(window, 'confirm').and.returnValue(false);
            component.clearCart();
            expect(cartServiceSpy.clearCart).not.toHaveBeenCalled();
        });
    });
});