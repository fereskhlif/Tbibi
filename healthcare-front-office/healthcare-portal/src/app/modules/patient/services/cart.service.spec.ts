import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Medicine } from '../models/medicine.model';

describe('CartService', () => {
    let service: CartService;

    const mockMedicine1: Medicine = {
        medicineId: 1,
        medicineName: 'Aspirin',
        description: 'Pain reliever',
        dosage: '500mg',
        price: 5.99,
        stock: 100,
        minStockAlert: 10,
        available: true,
        pharmacyId: 1,
        imageUrls: ['img1.jpg']
    };

    const mockMedicine2: Medicine = {
        medicineId: 2,
        medicineName: 'Ibuprofen',
        description: 'Anti-inflammatory',
        dosage: '400mg',
        price: 8.50,
        stock: 50,
        minStockAlert: 5,
        available: true,
        pharmacyId: 1,
        imageUrls: ['img2.jpg']
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CartService]
        });
        service = TestBed.inject(CartService);
    });

    // ── CREATION ─────────────────────────────────────────────────
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // ── INITIAL STATE ────────────────────────────────────────────
    describe('Initial State', () => {

        it('should start with empty cart', () => {
            expect(service.getItems().length).toBe(0);
        });

        it('should have 0 total amount initially', () => {
            expect(service.getTotalAmount()).toBe(0);
        });

        it('should have 0 item count initially', () => {
            expect(service.getItemCount()).toBe(0);
        });

        it('should return 0 as pharmacy ID when cart is empty', () => {
            expect(service.getPharmacyId()).toBe(0);
        });

        it('should emit empty array on cartItems$', (done) => {
            service.cartItems$.subscribe(items => {
                expect(items.length).toBe(0);
                done();
            });
        });
    });

    // ── ADD TO CART ──────────────────────────────────────────────
    describe('addToCart', () => {

        it('should add a new medicine to cart', () => {
            service.addToCart(mockMedicine1, 1);
            const items = service.getItems();
            expect(items.length).toBe(1);
            expect(items[0].medicine.medicineId).toBe(1);
            expect(items[0].quantity).toBe(1);
        });

        it('should add with specified quantity', () => {
            service.addToCart(mockMedicine1, 3);
            expect(service.getItems()[0].quantity).toBe(3);
        });

        it('should add with default quantity of 1', () => {
            service.addToCart(mockMedicine1);
            expect(service.getItems()[0].quantity).toBe(1);
        });

        it('should increase quantity if same medicine added again', () => {
            service.addToCart(mockMedicine1, 2);
            service.addToCart(mockMedicine1, 3);
            const items = service.getItems();
            expect(items.length).toBe(1);
            expect(items[0].quantity).toBe(5);
        });

        it('should not exceed stock when adding same medicine', () => {
            const lowStockMed: Medicine = { ...mockMedicine1, stock: 5 };
            service.addToCart(lowStockMed, 3);
            service.addToCart(lowStockMed, 4); // 3 + 4 = 7 > stock 5
            expect(service.getItems()[0].quantity).toBe(5);
        });

        it('should add multiple different medicines', () => {
            service.addToCart(mockMedicine1, 1);
            service.addToCart(mockMedicine2, 2);
            expect(service.getItems().length).toBe(2);
        });

        it('should emit updated items via cartItems$', (done) => {
            service.addToCart(mockMedicine1, 1);
            service.cartItems$.subscribe(items => {
                if (items.length > 0) {
                    expect(items[0].medicine.medicineName).toBe('Aspirin');
                    done();
                }
            });
        });
    });

    // ── REMOVE FROM CART ─────────────────────────────────────────
    describe('removeFromCart', () => {

        it('should remove medicine by ID', () => {
            service.addToCart(mockMedicine1, 1);
            service.addToCart(mockMedicine2, 1);
            service.removeFromCart(1);
            const items = service.getItems();
            expect(items.length).toBe(1);
            expect(items[0].medicine.medicineId).toBe(2);
        });

        it('should do nothing if medicine ID not in cart', () => {
            service.addToCart(mockMedicine1, 1);
            service.removeFromCart(999);
            expect(service.getItems().length).toBe(1);
        });

        it('should result in empty cart after removing all items', () => {
            service.addToCart(mockMedicine1, 1);
            service.removeFromCart(1);
            expect(service.getItems().length).toBe(0);
        });
    });

    // ── UPDATE QUANTITY ──────────────────────────────────────────
    describe('updateQuantity', () => {

        it('should update quantity for existing item', () => {
            service.addToCart(mockMedicine1, 1);
            service.updateQuantity(1, 5);
            expect(service.getItems()[0].quantity).toBe(5);
        });

        it('should not go below 1', () => {
            service.addToCart(mockMedicine1, 3);
            service.updateQuantity(1, 0);
            expect(service.getItems()[0].quantity).toBe(1);
        });

        it('should not go below 1 with negative value', () => {
            service.addToCart(mockMedicine1, 3);
            service.updateQuantity(1, -5);
            expect(service.getItems()[0].quantity).toBe(1);
        });

        it('should not exceed stock', () => {
            service.addToCart(mockMedicine1, 1);
            service.updateQuantity(1, 999);
            expect(service.getItems()[0].quantity).toBe(100); // stock is 100
        });

        it('should do nothing if medicine not in cart', () => {
            service.addToCart(mockMedicine1, 1);
            service.updateQuantity(999, 5);
            expect(service.getItems()[0].quantity).toBe(1);
        });
    });

    // ── CLEAR CART ───────────────────────────────────────────────
    describe('clearCart', () => {

        it('should remove all items', () => {
            service.addToCart(mockMedicine1, 2);
            service.addToCart(mockMedicine2, 3);
            service.clearCart();
            expect(service.getItems().length).toBe(0);
        });

        it('should reset total amount to 0', () => {
            service.addToCart(mockMedicine1, 2);
            service.clearCart();
            expect(service.getTotalAmount()).toBe(0);
        });

        it('should reset item count to 0', () => {
            service.addToCart(mockMedicine1, 2);
            service.clearCart();
            expect(service.getItemCount()).toBe(0);
        });
    });

    // ── CALCULATIONS ─────────────────────────────────────────────
    describe('Calculations', () => {

        it('should calculate total amount correctly', () => {
            service.addToCart(mockMedicine1, 2); // 5.99 * 2 = 11.98
            service.addToCart(mockMedicine2, 1); // 8.50 * 1 = 8.50
            const total = service.getTotalAmount();
            expect(total).toBeCloseTo(20.48, 2);
        });

        it('should calculate item count correctly', () => {
            service.addToCart(mockMedicine1, 3);
            service.addToCart(mockMedicine2, 2);
            expect(service.getItemCount()).toBe(5); // 3 + 2
        });

        it('should return correct pharmacy ID from first item', () => {
            service.addToCart(mockMedicine1, 1);
            expect(service.getPharmacyId()).toBe(1);
        });
    });

    // ── CART TOGGLE ──────────────────────────────────────────────
    describe('Cart Toggle', () => {

        it('should start with cart closed', (done) => {
            service.isCartOpen$.subscribe(isOpen => {
                expect(isOpen).toBe(false);
                done();
            });
        });

        it('should toggle cart open/close', () => {
            service.toggleCart();
            service.isCartOpen$.subscribe(isOpen => {
                expect(isOpen).toBe(true);
            });
        });

        it('should open cart', () => {
            service.openCart();
            service.isCartOpen$.subscribe(isOpen => {
                expect(isOpen).toBe(true);
            });
        });

        it('should close cart', () => {
            service.openCart();
            service.closeCart();
            service.isCartOpen$.subscribe(isOpen => {
                expect(isOpen).toBe(false);
            });
        });
    });
});