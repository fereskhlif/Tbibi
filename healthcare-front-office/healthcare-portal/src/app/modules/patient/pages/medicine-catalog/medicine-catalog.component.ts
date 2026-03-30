import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Medicine, Page } from '../../models/medicine.model';
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
    sortOption: string = 'medicineName,asc';
    filterOption: string = 'all';

    // Pagination
    currentPage = 1;
    pageSize = 12;
    totalElements = 0;
    totalPages = 0;
    private searchSubject = new Subject<string>();

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
        public router: Router
    ) { }

    ngOnInit(): void {
        this.loadPharmacies();

        // Search Debounce
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(query => {
            this.searchQuery = query;
            this.currentPage = 1;
            this.syncUrlAndLoad();
        });

        // Combined Route subscription
        this.route.params.subscribe(params => {
            const id = params['pharmacyId'];
            this.pharmacyId = id ? +id : null;
            this.selectedPharmacyId = this.pharmacyId;

            // Try to get pharmacy name from navigation state
            const nav = this.router.getCurrentNavigation();
            if (nav?.extras?.state?.['pharmacyName']) {
                this.pharmacyName = nav.extras.state['pharmacyName'];
            } else if (window.history.state?.pharmacyName) {
                this.pharmacyName = window.history.state.pharmacyName;
            }

            // After params, check or wait for query params
            this.route.queryParams.subscribe(qp => {
                this.searchQuery = qp['q'] || '';
                this.currentPage = qp['page'] ? +qp['page'] : 1;
                this.sortOption = qp['sort'] || 'medicineName,asc';
                
                this.fetchData();
            });
        });
    }

    private syncUrlAndLoad(): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { 
                q: this.searchQuery || null,
                page: this.currentPage,
                sort: this.sortOption
            },
            queryParamsHandling: 'merge'
        });
    }

    private fetchData(): void {
        this.loading = true;
        this.error = '';

        const page0 = this.currentPage - 1;
        let obs$;

        if (this.searchQuery.trim()) {
            obs$ = this.medicineService.searchPaginated(this.searchQuery, this.pharmacyId, page0, this.pageSize, this.sortOption);
        } else if (this.pharmacyId) {
            obs$ = this.medicineService.getByPharmacyPaginated(this.pharmacyId, page0, this.pageSize);
        } else {
            obs$ = this.medicineService.getAllPaginated(page0, this.pageSize, this.sortOption);
        }

        obs$.subscribe({
            next: (page) => {
                this.handlePage(page);
                this.loading = false;
            },
            error: (err) => {
                this.error = err.message || 'Failed to load medicines.';
                this.loading = false;
            }
        });
    }

    private handlePage(page: Page<Medicine>): void {
        this.medicines = page.content;
        this.filteredMedicines = page.content;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
        this.initializeQuantities();
    }

    loadMedicines(): void {
        this.currentPage = 1;
        this.pharmacyId = null;
        this.syncUrlAndLoad();
    }

    loadMedicinesByPharmacy(pharmacyId: number): void {
        this.router.navigate(['/patient/pharmacy', pharmacyId], { queryParams: { page: 1 } });
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

    onSearchInput(query: string): void {
        this.searchSubject.next(query);
    }

    onSortChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        this.sortOption = select.value;
        this.currentPage = 1;
        this.syncUrlAndLoad();
    }

    onFilterChange(event: Event): void {
        // Status filter (in-stock) is harder for server-side unless we add JPA filter.
        // For now, let's keep it simple or implement in backend if requested.
        const select = event.target as HTMLSelectElement;
        this.filterOption = select.value;
        this.fetchData();
    }

    changePage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.syncUrlAndLoad();
    }

    getPageNumbers(): number[] {
        const pages: number[] = [];
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    }

    getQty(med: Medicine): number {
        return this.quantities[med.medicineId] || 1;
    }

    increaseQty(med: Medicine) {
        this.increaseQuantity(med);
    }

    decreaseQty(med: Medicine) {
        this.decreaseQuantity(med);
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

    navigateToDetails(med: Medicine): void {
        this.router.navigate(['/patient/medicine', med.medicineId]);
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

    formatForm(form?: string): string {
        if (!form) return '';
        return form.charAt(0).toUpperCase() + form.slice(1).toLowerCase().replace('_', ' ');
    }
}