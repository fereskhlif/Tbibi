import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Pharmacy } from '../../models/pharmacy.model';
import { PatientMedicineService } from '../../services/patient-medicine.service';

@Component({
    selector: 'app-pharmacy-list',
    template: `
<div class="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans">
    <div style="max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px;">

        <!-- Header -->
        <div>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Pharmacy Stores</h1>
            <p class="text-sm text-gray-500 mt-1 font-medium">Select a pharmacy to browse available medicines</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
            <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <lucide-icon name="alert-circle" [size]="32" class="text-red-600"></lucide-icon>
            </div>
            <p class="text-red-900 font-bold text-lg">Could not load pharmacies</p>
            <p class="text-red-500 text-sm mt-1">{{error}}</p>
            <button (click)="loadPharmacies()" class="mt-6 bg-red-600 text-white px-8 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-all">Retry</button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex flex-col items-center justify-center py-24">
            <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Pharmacies...</p>
        </div>

        <!-- Pharmacy Cards Grid -->
        <div *ngIf="!loading && !error" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            <div *ngFor="let pharmacy of pharmacies"
                (click)="goToPharmacy(pharmacy)"
                class="bg-white border border-[#E5E7EB] rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all group flex flex-col gap-4">

                <!-- Icon -->
                <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <lucide-icon name="map-pin" [size]="28" class="text-blue-600"></lucide-icon>
                </div>

                <!-- Info -->
                <div class="flex flex-col gap-1 flex-1">
                    <h2 class="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{pharmacy.pharmacyName}}</h2>
                    <p class="text-sm text-gray-500">{{pharmacy.pharmacyAddress}}</p>
                </div>

                <!-- CTA -->
                <div class="flex items-center gap-2 text-blue-600 text-sm font-bold">
                    <span>Browse Medicines</span>
                    <lucide-icon name="chevron-right" [size]="16"></lucide-icon>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && pharmacies.length === 0"
            class="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div class="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <lucide-icon name="map-pin" [size]="36" class="text-gray-300"></lucide-icon>
            </div>
            <h3 class="text-lg font-bold text-gray-900">No pharmacies found</h3>
            <p class="text-sm text-gray-500 mt-1">Please check back later.</p>
        </div>

    </div>
</div>
    `
})
export class PharmacyListComponent implements OnInit {
    pharmacies: Pharmacy[] = [];
    loading = true;
    error = '';
    searchQuery = '';

    constructor(
        private medicineService: PatientMedicineService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadPharmacies();
    }

    loadPharmacies(): void {
        this.loading = true;
        this.error = '';
        this.medicineService.getPharmacies().subscribe({
            next: (data) => {
                this.pharmacies = data;
                this.loading = false;
            },
            error: (err) => {
                this.error = err.message || 'Failed to load pharmacies.';
                this.loading = false;
            }
        });
    }

    goToPharmacy(pharmacy: Pharmacy): void {
        this.router.navigate(['/patient/pharmacy', pharmacy.pharmacyId, 'medicines'], {
            state: { pharmacyName: pharmacy.pharmacyName }
        });
    }

    searchAllMedicines(): void {
        if (!this.searchQuery.trim()) return;
        this.router.navigate(['/patient/medicine-catalog'], {
            queryParams: { search: this.searchQuery }
        });
    }
}
