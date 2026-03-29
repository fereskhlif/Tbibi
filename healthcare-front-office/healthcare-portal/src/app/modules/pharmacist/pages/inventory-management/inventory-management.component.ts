import { Component, OnInit } from '@angular/core';
import { MedicineService, MedicineResponse } from '../../../patient/services/medicine.service';

@Component({
  selector: 'app-inventory-management',
  template: `
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <div><h1 class="text-2xl font-bold text-gray-900">Inventory Management</h1><p class="text-gray-600">Track and manage pharmacy inventory</p></div>
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="text-center py-12"><p class="text-gray-500">Loading inventory...</p></div>

    <!-- Error -->
    <div *ngIf="error" class="text-center py-12">
      <p class="text-red-500">{{error}}</p>
      <button (click)="loadInventory()" class="mt-4 px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700">Retry</button>
    </div>

    <div *ngIf="!loading && !error">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-gray-200 p-4"><p class="text-sm text-gray-500">Total Items</p><p class="text-2xl font-bold text-gray-900">{{medicines.length}}</p></div>
        <div class="bg-white rounded-xl border border-gray-200 p-4"><p class="text-sm text-gray-500">Low Stock (&lt;20)</p><p class="text-2xl font-bold text-red-600">{{lowStockCount}}</p></div>
        <div class="bg-white rounded-xl border border-gray-200 p-4"><p class="text-sm text-gray-500">Out of Stock</p><p class="text-2xl font-bold text-orange-600">{{outOfStockCount}}</p></div>
        <div class="bg-white rounded-xl border border-gray-200 p-4"><p class="text-sm text-gray-500">Total Stock Units</p><p class="text-2xl font-bold text-blue-600">{{totalStock}}</p></div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Inventory Items</h3>
        <div *ngIf="medicines.length === 0" class="text-center py-8 text-gray-500">No inventory items found</div>
        <div class="space-y-3">
          <div *ngFor="let med of medicines" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <span class="text-xl">💊</span>
              <div>
                <p class="font-medium text-gray-900">{{med.medicineName}}</p>
                <p class="text-sm text-gray-500">ID: #{{med.medicineId}} • Qty: {{med.quantity}}</p>
              </div>
            </div>
            <div class="flex items-center gap-6">
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">{{med.stock}} units</p>
                <p class="text-xs text-gray-500">Exp: {{med.dateOfExpiration | date:'mediumDate'}}</p>
              </div>
              <div class="w-24 bg-gray-200 rounded-full h-2">
                <div [class]="'h-2 rounded-full ' + getBarClass(med.stock)" [style.width.%]="getStockPercent(med.stock)"></div>
              </div>
              <span class="text-sm font-medium" [class]="med.price ? 'text-gray-700' : 'text-gray-400'">{{med.price.toFixed(2)}} DT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class InventoryManagementComponent implements OnInit {
  medicines: MedicineResponse[] = [];
  loading = true;
  error = '';

  lowStockCount = 0;
  outOfStockCount = 0;
  totalStock = 0;

  constructor(private medicineService: MedicineService) { }

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.loading = true;
    this.error = '';
    this.medicineService.getAll().subscribe({
      next: (data) => {
        this.medicines = data;
        this.lowStockCount = data.filter(m => m.stock > 0 && m.stock < 20).length;
        this.outOfStockCount = data.filter(m => m.stock === 0).length;
        this.totalStock = data.reduce((sum, m) => sum + m.stock, 0);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load inventory. Make sure the backend is running.';
        this.loading = false;
        console.error('Error loading inventory:', err);
      }
    });
  }

  getStockPercent(stock: number): number {
    const maxStock = 200;
    return Math.min((stock / maxStock) * 100, 100);
  }

  getBarClass(stock: number): string {
    if (stock === 0) return 'bg-red-500';
    if (stock < 20) return 'bg-orange-500';
    if (stock < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  }
}
