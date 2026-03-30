import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { MedicineCatalogComponent } from './medicine-catalog.component';
import { CartService } from '../../services/cart.service';
import { PatientMedicineService } from '../../services/patient-medicine.service';
import { PatientOrderService } from '../../services/patient-order.service';
import { MainLayoutComponent } from '../../../../shared/layouts/main-layout/main-layout.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Medicine } from '../../models/medicine.model';

describe('MedicineCatalogComponent', () => {
    let component: MedicineCatalogComponent;
    let fixture: ComponentFixture<MedicineCatalogComponent>;
    let medicineServiceSpy: jasmine.SpyObj<PatientMedicineService>;
    let cartServiceSpy: jasmine.SpyObj<CartService>;
    let routerSpy: jasmine.SpyObj<Router>;

    const mockMedicines: Medicine[] = [
        {
            medicineId: 1, medicineName: 'Aspirin', description: 'Pain reliever',
            dosage: '500mg', price: 5.99, stock: 100, minStockAlert: 10,
            available: true, pharmacyId: 1, imageUrls: ['']
        },
        {
            medicineId: 2, medicineName: 'Ibuprofen', description: 'Anti-inflammatory',
            dosage: '400mg', price: 8.50, stock: 0, minStockAlert: 5,
            available: true, pharmacyId: 1, imageUrls: []
        },
        {
            medicineId: 3, medicineName: 'Paracetamol', description: 'Fever reducer',
            dosage: '1000mg', price: 3.00, stock: 50, minStockAlert: 5,
            available: true, pharmacyId: 1, imageUrls: ['']
        }
    ];

    beforeEach(async () => {
        medicineServiceSpy = jasmine.createSpyObj('PatientMedicineService', [
            'getAll', 'getByPharmacy', 'getPharmacies', 
            'getAllPaginated', 'getByPharmacyPaginated', 'searchPaginated'
        ]);
        cartServiceSpy = jasmine.createSpyObj('CartService', ['addToCart']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);

        medicineServiceSpy.getAll.and.returnValue(of(mockMedicines));
        medicineServiceSpy.getByPharmacy.and.returnValue(of(mockMedicines));
        medicineServiceSpy.getPharmacies.and.returnValue(of([]));
        
        const mockPage = {
            content: mockMedicines,
            totalPages: 1,
            totalElements: mockMedicines.length
        };
        medicineServiceSpy.getAllPaginated.and.returnValue(of(mockPage as any));
        medicineServiceSpy.getByPharmacyPaginated.and.returnValue(of(mockPage as any));
        medicineServiceSpy.searchPaginated.and.returnValue(of(mockPage as any));

        routerSpy.getCurrentNavigation.and.returnValue(null);
        spyOn(MainLayoutComponent, 'showToast');

        await TestBed.configureTestingModule({
            declarations: [MedicineCatalogComponent],
            imports: [FormsModule],
            providers: [
                { provide: PatientMedicineService, useValue: medicineServiceSpy },
                { provide: CartService, useValue: cartServiceSpy },
                { provide: PatientOrderService, useValue: { createOrder: () => of({}) } },
                { provide: Router, useValue: routerSpy },
                {
                    provide: ActivatedRoute,
                    useValue: { 
                        params: of({ pharmacyId: '1' }),
                        queryParams: of({ q: '', page: 1, sort: 'name,asc' }),
                        snapshot: { queryParams: {} }
                    }
                }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(MedicineCatalogComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // ── LOADING ──────────────────────────────────────────────────
    describe('Loading', () => {

        it('should load medicines on init', fakeAsync(() => {
            fixture.detectChanges();
            flush();
            expect(component.medicines.length).toBe(3);
            expect(component.loading).toBe(false);
        }));


        it('should initialize quantities to 1 for each medicine', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            expect(component.quantities[1]).toBe(1);
            expect(component.quantities[2]).toBe(1);
            expect(component.quantities[3]).toBe(1);
        }));
    });

    describe('Filtering & Search', () => {
        
        it('should trigger search on input', () => {
             spyOn((component as any).searchSubject, 'next');
             component.onSearchInput('asp');
             expect((component as any).searchSubject.next).toHaveBeenCalledWith('asp');
        });

        it('should handle filter change', () => {
            const event = { target: { value: 'in-stock' } } as any;
            spyOn(component as any, 'fetchData');
            component.onFilterChange(event);
            expect(component.filterOption).toBe('in-stock');
            expect((component as any).fetchData).toHaveBeenCalled();
        });
    });

    describe('Sorting', () => {
        it('should handle sort change', () => {
            const event = { target: { value: 'price,asc' } } as any;
            spyOn(component as any, 'syncUrlAndLoad');
            component.onSortChange(event);
            expect(component.sortOption).toBe('price,asc');
            expect(component.currentPage).toBe(1);
            expect((component as any).syncUrlAndLoad).toHaveBeenCalled();
        });
    });

    // ── QUANTITY ─────────────────────────────────────────────────
    describe('Quantity Management', () => {

        beforeEach(fakeAsync(() => {
            fixture.detectChanges();
            flush();
        }));

        it('should increase quantity', () => {
            component.increaseQuantity(mockMedicines[0]);
            expect(component.quantities[1]).toBe(2);
        });

        it('should not increase beyond stock', () => {
            component.quantities[1] = 100;
            component.increaseQuantity(mockMedicines[0]);
            expect(component.quantities[1]).toBe(100);
        });

        it('should decrease quantity', () => {
            component.quantities[1] = 3;
            component.decreaseQuantity(mockMedicines[0]);
            expect(component.quantities[1]).toBe(2);
        });

        it('should not decrease below 1', () => {
            component.quantities[1] = 1;
            component.decreaseQuantity(mockMedicines[0]);
            expect(component.quantities[1]).toBe(1);
        });
    });

    // ── CART INTERACTION ─────────────────────────────────────────
    describe('Cart', () => {

        beforeEach(fakeAsync(() => {
            fixture.detectChanges();
            flush();
        }));

        it('should add medicine to cart', () => {
            component.addToCart(mockMedicines[0], 2);
            expect(cartServiceSpy.addToCart).toHaveBeenCalledWith(mockMedicines[0], 2);
        });

        it('should close detail modal after adding to cart', () => {
            component.selectedMedicine = mockMedicines[0];
            component.addToCart(mockMedicines[0], 1);
            expect(component.selectedMedicine).toBeNull();
        });
    });

    // ── DETAIL MODAL ─────────────────────────────────────────────
    describe('Detail Modal', () => {

        it('should open details', () => {
            component.openDetails(mockMedicines[0]);
            expect(component.selectedMedicine).toEqual(mockMedicines[0]);
            expect(component.detailQuantity).toBe(1);
        });

        it('should close details', () => {
            component.selectedMedicine = mockMedicines[0];
            component.closeDetails();
            expect(component.selectedMedicine).toBeNull();
        });
    });

    // ── IMAGE HELPER ─────────────────────────────────────────────
    describe('getFirstImage', () => {

        it('should return first image', () => {
            expect(component.getFirstImage(mockMedicines[0])).toBe('');
        });

        it('should return placeholder for no images', () => {
            expect(component.getFirstImage(mockMedicines[1]))
                .toContain('assets/images/placeholder-medicine.png');
        });
    });

    // ── NAVIGATION ───────────────────────────────────────────────
    describe('Navigation', () => {

        it('should navigate back to pharmacy list', () => {
            component.goBack();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/patient/pharmacy-list']);
        });
    });
});