import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Pharmacy } from '../../models/pharmacy.model';
import { PatientMedicineService } from '../../services/patient-medicine.service';

@Component({
    selector: 'app-pharmacy-list',
    template: `
<div style="min-height: 100vh; background-color: #F8FAFC; padding-bottom: 5rem; font-family: ui-sans-serif, system-ui, sans-serif;">
    
    <!-- Hero Section (Gradient + Glass Search) -->
    <div style="background: linear-gradient(135deg, #1d4ed8, #2563eb, #60a5fa); padding: 4rem 1.5rem; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; text-align: center; color: white;">
        
        <!-- Abstract Shapes for UI Pro Max Aesthetic -->
        <div style="position: absolute; top: -50px; left: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(40px);"></div>
        <div style="position: absolute; bottom: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.15); border-radius: 50%; filter: blur(40px);"></div>
        
        <h1 style="font-size: 2.5rem; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 1rem; position: relative; z-index: 10;">Find a Pharmacy Near You</h1>
        <p style="font-size: 1.125rem; font-weight: 500; color: rgba(255,255,255,0.9); max-width: 600px; margin-bottom: 2.5rem; position: relative; z-index: 10;">Browse reliable partner pharmacies and search our extensive catalog of medical supplies</p>
        
        <!-- Global Medicine Search -->
        <div style="width: 100%; max-width: 700px; position: relative; z-index: 10;">
            <div style="display: flex; align-items: center; background: rgba(255, 255, 255, 0.95); padding: 0.5rem; border-radius: 9999px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);">
                <div style="padding-left: 1rem; padding-right: 0.5rem; color: #6b7280; display: flex; align-items: center;">
                    <lucide-icon name="search" [size]="20"></lucide-icon>
                </div>
                <input [(ngModel)]="searchQuery" (keyup.enter)="searchAllMedicines()"
                    style="flex: 1; background: transparent; border: none; outline: none; padding: 0.75rem 0; font-size: 1rem; color: #111827; min-width: 0;"
                    placeholder="Search for medicines across all pharmacies..." />
                <button (click)="searchAllMedicines()" 
                    style="background: #2563eb; color: white; padding: 0.75rem 1.75rem; border-radius: 9999px; font-weight: 700; font-size: 0.875rem; border: none; cursor: pointer; transition: background 0.2s; white-space: nowrap;"
                    onmouseover="this.style.backgroundColor='#1d4ed8'"
                    onmouseout="this.style.backgroundColor='#2563eb'">
                    Search Catalog
                </button>
            </div>
        </div>
    </div>

    <!-- Main Content Wrapper -->
    <div style="max-width: 1280px; margin: -2rem auto 0; padding: 0 1.5rem; position: relative; z-index: 20; display: flex; flex-direction: column; gap: 32px;">
    
        <!-- States -->
        <!-- Error State -->
        <div *ngIf="error" style="background: white; border: 1px solid #fee2e2; padding: 3rem; border-radius: 1.5rem; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="width: 4rem; height: 4rem; background: #fee2e2; border-radius: 1rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                <lucide-icon name="alert-triangle" [size]="32" class="text-red-600"></lucide-icon>
            </div>
            <p style="color: #991b1b; font-weight: 700; font-size: 1.125rem;">Could not load pharmacies</p>
            <p style="color: #ef4444; font-size: 0.875rem; margin-top: 0.5rem;">{{error}}</p>
            <button (click)="loadPharmacies()" style="margin-top: 1.5rem; background: #dc2626; color: white; padding: 0.5rem 2rem; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 700; border: none; cursor: pointer;"
                onmouseover="this.style.filter='brightness(1.1)'"
                onmouseout="this.style.filter='brightness(1)'">Retry Connection</button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6rem 0; background: white; border-radius: 1.5rem; box-shadow: 0 4px 10px rgba(0,0,0,0.02); border: 1px solid #f3f4f6;">
            <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p style="margin-top: 1rem; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem;">Loading Partner Pharmacies...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && pharmacies.length === 0" style="text-align: center; padding: 6rem 0; background: white; border-radius: 1.5rem; border: 2px dashed #f3f4f6;">
            <div style="width: 5rem; height: 5rem; background: #f9fafb; border-radius: 1rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                <lucide-icon name="shopping-bag" [size]="40" class="text-gray-300"></lucide-icon>
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: #111827;">No Stores Available</h3>
            <p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">We currently have no partner pharmacies listed. Please check back later.</p>
        </div>

        <!-- Section Title (Only show when there are stores) -->
        <div *ngIf="!loading && !error && pharmacies.length > 0" style="padding-top: 2rem;">
            <h2 style="font-size: 1.5rem; font-weight: 800; color: #111827; display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 2.5rem; height: 2.5rem; background: #eff6ff; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: #2563eb;">
                    <lucide-icon name="activity" [size]="20"></lucide-icon>
                </div>
                Available Pharmacies
            </h2>
            <p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">Navigate locally to find exactly what you need quickly.</p>
        </div>

        <!-- Pharmacy Cards Grid -->
        <div *ngIf="!loading && !error && pharmacies.length > 0" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
            <div *ngFor="let pharmacy of pharmacies"
                (click)="goToPharmacy(pharmacy)"
                style="background: white; border: 1px solid #e5e7eb; border-radius: 1.25rem; padding: 1.5rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; gap: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);"
                onmouseover="this.style.boxShadow='0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)'; this.style.borderColor='#bfdbfe'; this.style.transform='translateY(-2px)';"
                onmouseout="this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.03)'; this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)';">

                <!-- Header block -->
                <div style="display: flex; align-items: flex-start; gap: 1rem;">
                    <div style="width: 3.5rem; height: 3.5rem; background: #eff6ff; border-radius: 1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #2563eb;">
                        <lucide-icon name="shopping-bag" [size]="24"></lucide-icon>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h2 style="font-size: 1.125rem; font-weight: 800; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.25rem; transition: color 0.15s ease;"
                            onmouseover="this.style.color='#2563eb'"
                            onmouseout="this.style.color='#111827'">{{pharmacy.pharmacyName}}</h2>
                        <div style="display: flex; align-items: flex-start; gap: 0.375rem; color: #6b7280;">
                            <lucide-icon name="map-pin" [size]="14" style="margin-top: 0.125rem; flex-shrink: 0;"></lucide-icon>
                            <p style="font-size: 0.8125rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">{{pharmacy.pharmacyAddress}}</p>
                        </div>
                    </div>
                </div>

                <!-- Spacer -->
                <div style="flex: 1;"></div>

                <!-- Splitter -->
                <div style="height: 1px; background: #f3f4f6; width: 100%;"></div>

                <!-- CTA -->
                <div style="display: flex; align-items: center; justify-content: space-between; color: #2563eb; font-weight: 700; font-size: 0.875rem;">
                    <span style="display: flex; align-items: center; gap: 0.5rem;">
                        <lucide-icon name="pill" [size]="16"></lucide-icon>
                        Browse Medicines
                    </span>
                    <div style="width: 2rem; height: 2rem; background: #eff6ff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                        <lucide-icon name="chevron-right" [size]="16"></lucide-icon>
                    </div>
                </div>
            </div>
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
