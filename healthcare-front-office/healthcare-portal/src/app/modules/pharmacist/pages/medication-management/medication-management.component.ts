import { Component } from '@angular/core';
@Component({
    selector: 'app-medication-management', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Medication Management</h1><p class="text-gray-600 mb-6">Manage medication database and information</p>
    <div class="mb-6"><input type="text" [(ngModel)]="search" class="w-full px-4 py-3 border border-gray-300 rounded-xl" placeholder="Search medications..." /></div>
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medication</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
      <tbody class="divide-y divide-gray-200">
        <tr *ngFor="let med of filteredMeds" class="hover:bg-gray-50">
          <td class="px-6 py-4"><p class="font-medium text-gray-900">{{med.name}}</p><p class="text-xs text-gray-500">{{med.dosage}}</p></td>
          <td class="px-6 py-4 text-sm text-gray-600">{{med.category}}</td>
          <td class="px-6 py-4 text-sm font-medium" [class]="med.stock < 20 ? 'text-red-600' : 'text-gray-900'">{{med.stock}}</td>
          <td class="px-6 py-4 text-sm text-gray-900">{{med.price}}</td>
          <td class="px-6 py-4"><span [class]="'px-2 py-1 text-xs rounded-full ' + med.statusClass">{{med.status}}</span></td>
        </tr>
      </tbody></table>
    </div>
  </div>
` })
export class MedicationManagementComponent {
    search = '';
    medications = [
        { name: 'Amoxicillin', dosage: '500mg capsules', category: 'Antibiotics', stock: 5, price: '$12.99', status: 'Low Stock', statusClass: 'bg-red-100 text-red-700' },
        { name: 'Paracetamol', dosage: '1000mg tablets', category: 'Pain Relief', stock: 150, price: '$3.99', status: 'In Stock', statusClass: 'bg-green-100 text-green-700' },
        { name: 'Metformin', dosage: '850mg tablets', category: 'Diabetes', stock: 200, price: '$18.50', status: 'In Stock', statusClass: 'bg-green-100 text-green-700' },
        { name: 'Ibuprofen', dosage: '400mg tablets', category: 'Pain Relief', stock: 80, price: '$8.99', status: 'In Stock', statusClass: 'bg-green-100 text-green-700' },
        { name: 'Atorvastatin', dosage: '20mg tablets', category: 'Cardiovascular', stock: 12, price: '$15.00', status: 'Low Stock', statusClass: 'bg-red-100 text-red-700' }
    ];
    get filteredMeds() { return this.search ? this.medications.filter(m => m.name.toLowerCase().includes(this.search.toLowerCase())) : this.medications; }
}
