import { Component } from '@angular/core';
@Component({
    selector: 'app-drug-availability', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Drug Availability</h1><p class="text-gray-600 mb-6">Check real-time drug availability and alternatives</p>
    <div class="mb-6"><input type="text" [(ngModel)]="search" class="w-full px-4 py-3 border border-gray-300 rounded-xl" placeholder="Search for a medication..." /></div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div *ngFor="let drug of filteredDrugs" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3"><h3 class="font-semibold text-gray-900">{{drug.name}}</h3>
        <span [class]="'w-3 h-3 rounded-full ' + (drug.available ? 'bg-green-500' : 'bg-red-500')"></span></div>
        <p class="text-sm text-gray-500 mb-3">{{drug.category}} • {{drug.dosage}}</p>
        <div class="flex items-center justify-between"><span class="text-lg font-bold" [class]="drug.available ? 'text-green-600' : 'text-red-600'">{{drug.available ? 'Available' : 'Out of Stock'}}</span>
        <span class="text-sm text-gray-500" *ngIf="drug.available">{{drug.stock}} units</span></div>
        <div *ngIf="!drug.available && drug.alternative" class="mt-3 p-2 bg-blue-50 rounded-lg"><p class="text-xs text-blue-700">Alternative: <strong>{{drug.alternative}}</strong></p></div>
      </div>
    </div>
  </div>
` })
export class DrugAvailabilityComponent {
    search = '';
    drugs = [
        { name: 'Amoxicillin 500mg', category: 'Antibiotics', dosage: 'Capsules', available: false, stock: 0, alternative: 'Clamoxyl 500mg' },
        { name: 'Paracetamol 1000mg', category: 'Pain Relief', dosage: 'Tablets', available: true, stock: 150, alternative: null },
        { name: 'Ibuprofen 400mg', category: 'Pain Relief', dosage: 'Tablets', available: true, stock: 80, alternative: null },
        { name: 'Metformin 850mg', category: 'Diabetes', dosage: 'Tablets', available: true, stock: 200, alternative: null },
        { name: 'Atorvastatin 20mg', category: 'Cardiovascular', dosage: 'Tablets', available: false, stock: 0, alternative: 'Simvastatin 20mg' },
        { name: 'Vitamin D3 1000IU', category: 'Vitamins', dosage: 'Capsules', available: true, stock: 30, alternative: null }
    ];
    get filteredDrugs() { return this.search ? this.drugs.filter(d => d.name.toLowerCase().includes(this.search.toLowerCase())) : this.drugs; }
}
