import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Medicine } from '../../models/medicine.model';
import { Pharmacy } from '../../models/pharmacy.model';
import { OrderRequest } from '../../models/order.model';
import { CartService } from '../../services/cart.service';
import { PatientMedicineService } from '../../services/patient-medicine.service';
import { PatientOrderService } from '../../services/patient-order.service';
import { MainLayoutComponent } from '../../../../shared/layouts/main-layout/main-layout.component';

@Component({
    selector: 'app-medicine-catalog',
    templateUrl: './medicine-catalog.component.html'
})
export class MedicineCatalogComponent implements OnInit {
    medicines: Medicine[] = [];
    filteredMedicines: Medicine[] = [];
    pharmacies: Pharmacy[] = [];
    loading = true;
    error = '';
    searchQuery = '';

    // Sort and Filter
    sortOption: string = 'name-asc';
    filterOption: string = 'all';

    // UI State
    pharmacyId: number | null = null;
    pharmacyName: string = '';
    selectedMedicine: Medicine | null = null;
    detailQuantity = 1;
    selectedPharmacyId: number | null = null;
    // Quantity state per card
    quantities: { [id: number]: number } = {};

    constructor(
        public cartService: CartService,
        private medicineService: PatientMedicineService,
        private orderService: PatientOrderService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {

        // Try to get pharmacyId from route params
        this.route.paramMap.subscribe(params => {
            const id = params.get('pharmacyId');
            if (id) {
                this.pharmacyId = +id;
                // Try to get pharmacy name from navigation state
                const nav = this.router.getCurrentNavigation();
                if (nav?.extras?.state?.['pharmacyName']) {
                    this.pharmacyName = nav.extras.state['pharmacyName'];
                }
                // Fallback: fetch from history state
                if (!this.pharmacyName && window.history.state?.pharmacyName) {
                    this.pharmacyName = window.history.state.pharmacyName;
                }
                this.selectedPharmacyId = this.pharmacyId;
                this.loadMedicinesByPharmacy(this.pharmacyId);
            } else {
                // Legacy: load all medicines
                this.loadMedicines();
            }
        });

        this.loadPharmacies();
    }

    loadMedicines(): void {
        this.loading = true;
        this.error = '';
        this.medicineService.getAll().subscribe({
            next: (data) => {
                this.medicines = data;
                this.initializeQuantities();
                this.applyFilters();
                this.loading = false;
            },
            error: (err) => {
                this.error = err.message || 'Failed to load medicines.';
                this.loading = false;
            }
        });
    }

    loadMedicinesByPharmacy(pharmacyId: number): void {
        this.loading = true;
        this.error = '';
        this.medicineService.getByPharmacy(pharmacyId).subscribe({
            next: (data) => {
                this.medicines = data;
                this.initializeQuantities();
                this.applyFilters();
                this.loading = false;
            },
            error: (err) => {
                this.error = err.message || 'Failed to load medicines for this pharmacy.';
                this.loading = false;
            }
        });
    }

    loadPharmacies(): void {
        this.medicineService.getPharmacies().subscribe({
            next: (data) => { this.pharmacies = data; },
            error: () => { }
        });
    }

    initializeQuantities() {
        this.medicines.forEach(m => {
            this.quantities[m.medicineId] = 1;
        });
    }

    onSearch(): void {
        this.applyFilters();
    }

    onSortChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        this.sortOption = select.value;
        this.applyFilters();
    }

    onFilterChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        this.filterOption = select.value;
        this.applyFilters();
    }

    applyFilters() {
        let result = [...this.medicines];

        // Search
        const q = this.searchQuery.toLowerCase().trim();
        if (q) {
            result = result.filter(m => m.medicineName.toLowerCase().includes(q));
        }

        // Filter
        if (this.filterOption === 'in-stock') {
            result = result.filter(m => m.stock > 0);
        }

        // Sort
        if (this.sortOption === 'price-asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (this.sortOption === 'price-desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (this.sortOption === 'name-asc') {
            result.sort((a, b) => a.medicineName.localeCompare(b.medicineName));
        }

        this.filteredMedicines = result;
    }

    increaseQuantity(med: Medicine) {
        if (!this.quantities[med.medicineId]) this.quantities[med.medicineId] = 1;
        if (this.quantities[med.medicineId] < med.stock) {
            this.quantities[med.medicineId]++;
        }
    }

    decreaseQuantity(med: Medicine) {
        if (!this.quantities[med.medicineId]) this.quantities[med.medicineId] = 1;
        if (this.quantities[med.medicineId] > 1) {
            this.quantities[med.medicineId]--;
        }
    }

    openDetails(med: Medicine): void {
        this.selectedMedicine = med;
        this.detailQuantity = this.quantities[med.medicineId] || 1;
    }

    closeDetails(): void {
        this.selectedMedicine = null;
    }

    addToCart(med: Medicine, qty: number): void {
        this.cartService.addToCart(med, qty);
        MainLayoutComponent.showToast(`${med.medicineName} added to cart`, 'success');

        if (this.selectedMedicine) {
            this.closeDetails();
        }
    }

    goBack(): void {
        this.router.navigate(['/patient/pharmacy-list']);
    }

    getFirstImage(med: Medicine): string {
        return med.imageUrls && med.imageUrls.length > 0
            ? med.imageUrls[0]
            : 'assets/images/placeholder-medicine.png';
    }
}