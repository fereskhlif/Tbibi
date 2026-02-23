import { Component } from '@angular/core';
@Component({
    selector: 'app-order-validation', template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Order Validation</h1><p class="text-gray-600 mb-6">Review and validate incoming orders</p>
    <div class="space-y-4">
      <div *ngFor="let order of orders" class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div><h3 class="font-semibold text-gray-900">Order #{{order.id}}</h3><p class="text-sm text-gray-500">{{order.patient}} • {{order.date}}</p></div>
          <span [class]="'px-3 py-1 text-xs rounded-full ' + order.statusClass">{{order.status}}</span>
        </div>
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <div *ngFor="let item of order.items" class="flex justify-between py-1 text-sm"><span class="text-gray-700">{{item.name}} ({{item.qty}})</span><span class="text-gray-900 font-medium">{{item.price}}</span></div>
          <div class="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold"><span>Total</span><span>{{order.total}}</span></div>
        </div>
        <div class="flex gap-2" *ngIf="order.status === 'Pending'"><button class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Approve</button><button class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Reject</button><button class="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Contact Doctor</button></div>
      </div>
    </div>
  </div>
` })
export class OrderValidationComponent {
    orders = [
        { id: 'ORD-2024-001', patient: 'John Doe', date: 'Jan 15, 2024', status: 'Pending', statusClass: 'bg-yellow-100 text-yellow-700', total: '$45.98', items: [{ name: 'Amoxicillin 500mg', qty: '21 caps', price: '$12.99' }, { name: 'Ibuprofen 400mg', qty: '30 tabs', price: '$8.99' }, { name: 'Vitamin D3 1000IU', qty: '30 caps', price: '$24.00' }] },
        { id: 'ORD-2024-002', patient: 'Jane Smith', date: 'Jan 15, 2024', status: 'Pending', statusClass: 'bg-yellow-100 text-yellow-700', total: '$18.50', items: [{ name: 'Metformin 850mg', qty: '60 tabs', price: '$18.50' }] },
        { id: 'ORD-2024-003', patient: 'Mike Brown', date: 'Jan 14, 2024', status: 'Approved', statusClass: 'bg-green-100 text-green-700', total: '$32.99', items: [{ name: 'Atorvastatin 20mg', qty: '30 tabs', price: '$15.00' }, { name: 'Aspirin 81mg', qty: '90 tabs', price: '$17.99' }] }
    ];
}
