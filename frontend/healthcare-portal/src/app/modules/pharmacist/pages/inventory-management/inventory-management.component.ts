import { Component } from '@angular/core';
@Component({
    selector: 'app-inventory-management', template: `
  <div class="p-8">
    <div class="flex items-center justify-between mb-6"><div><h1 class="text-2xl font-bold text-gray-900">Inventory Management</h1><p class="text-gray-600">Track and manage pharmacy inventory</p></div>
    <button class="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700">+ New Order</button></div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div *ngFor="let stat of stats" class="bg-white rounded-xl border border-gray-200 p-4"><p class="text-sm text-gray-500">{{stat.label}}</p><p class="text-2xl font-bold" [class]="stat.color">{{stat.value}}</p></div>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="font-semibold text-gray-900 mb-4">Inventory Items</h3>
      <div class="space-y-3">
        <div *ngFor="let item of inventory" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3"><span class="text-xl">{{item.icon}}</span><div><p class="font-medium text-gray-900">{{item.name}}</p><p class="text-sm text-gray-500">{{item.category}} • Lot: {{item.lotNumber}}</p></div></div>
          <div class="flex items-center gap-6">
            <div class="text-right"><p class="text-sm font-medium text-gray-900">{{item.stock}} units</p><p class="text-xs text-gray-500">Exp: {{item.expiry}}</p></div>
            <div class="w-24 bg-gray-200 rounded-full h-2"><div [class]="'h-2 rounded-full ' + item.barClass" [style.width.%]="item.stockPercent"></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class InventoryManagementComponent {
    stats = [
        { label: 'Total Items', value: '1,245', color: 'text-gray-900' },
        { label: 'Low Stock', value: '12', color: 'text-red-600' },
        { label: 'Expiring Soon', value: '8', color: 'text-orange-600' },
        { label: 'Orders Pending', value: '3', color: 'text-blue-600' }
    ];
    inventory = [
        { name: 'Amoxicillin 500mg', category: 'Antibiotics', stock: 5, stockPercent: 10, lotNumber: 'LOT-2024-001', expiry: 'Jun 2025', icon: '💊', barClass: 'bg-red-500' },
        { name: 'Paracetamol 1000mg', category: 'Pain Relief', stock: 150, stockPercent: 75, lotNumber: 'LOT-2024-002', expiry: 'Dec 2025', icon: '💊', barClass: 'bg-green-500' },
        { name: 'Ibuprofen 400mg', category: 'Pain Relief', stock: 80, stockPercent: 53, lotNumber: 'LOT-2024-003', expiry: 'Sep 2025', icon: '💊', barClass: 'bg-yellow-500' },
        { name: 'Metformin 850mg', category: 'Diabetes', stock: 200, stockPercent: 90, lotNumber: 'LOT-2024-004', expiry: 'Mar 2026', icon: '💊', barClass: 'bg-green-500' },
        { name: 'Vitamin D3 1000IU', category: 'Vitamins', stock: 30, stockPercent: 30, lotNumber: 'LOT-2024-005', expiry: 'Nov 2025', icon: '💊', barClass: 'bg-orange-500' }
    ];
}
