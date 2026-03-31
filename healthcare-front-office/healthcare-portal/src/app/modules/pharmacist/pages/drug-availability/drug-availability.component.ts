import { Component, OnInit } from '@angular/core';
import { MedicineService, MedicineResponse } from '../../../patient/services/medicine.service';

@Component({
  selector: 'app-drug-availability',
  template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Drug Availability</h1><p class="text-gray-600 mb-6">Check real-time drug availability</p>

    <!-- Loading -->
    <div *ngIf="loading" class="text-center py-12"><p class="text-gray-500">Loading drug availability...</p></div>

    <!-- Error -->
    <div *ngIf="error" class="text-center py-12">
      <p class="text-red-500">{{error}}</p>
      <button (click)="loadMedicines()" class="mt-4 px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700">Retry</button>
    </div>

    <div *ngIf="!loading && !error">
      <div class="mb-6"><input type="text" [(ngModel)]="search" class="w-full px-4 py-3 border border-gray-300 rounded-xl" placeholder="Search for a medication..." /></div>

      <div *ngIf="filteredMedicines.length === 0" class="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p class="text-gray-500">No medications found</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let med of filteredMedicines" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-900">{{med.medicineName}}</h3>
            <span [class]="'w-3 h-3 rounded-full ' + (med.stock > 0 ? 'bg-green-500' : 'bg-red-500')"></span>
          </div>
          <p class="text-sm text-gray-500 mb-1">Qty: {{med.quantity}} • Price: {{med.price.toFixed(2)}} DT</p>
          <p class="text-sm text-gray-500 mb-3">Exp: {{med.dateOfExpiration | date:'mediumDate'}}</p>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold" [class]="med.stock > 0 ? 'text-green-600' : 'text-red-600'">{{med.stock > 0 ? 'Available' : 'Out of Stock'}}</span>
            <span class="text-sm text-gray-500" *ngIf="med.stock > 0">{{med.stock}} units</span>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class DrugAvailabilityComponent implements OnInit {
  search = '';
  medicines: MedicineResponse[] = [];
  loading = true;
  error = '';

  constructor(private medicineService: MedicineService) { }

  ngOnInit() {
    this.loadMedicines();
  }

  loadMedicines() {
    this.loading = true;
    this.error = '';
    this.medicineService.getAll().subscribe({
      next: (data) => {
        this.medicines = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load medications. Make sure the backend is running.';
        this.loading = false;
        console.error('Error loading medications:', err);
      }
    });
  }

  get filteredMedicines() {
    return this.search
      ? this.medicines.filter(d => d.medicineName.toLowerCase().includes(this.search.toLowerCase()))
      : this.medicines;
  }
}
