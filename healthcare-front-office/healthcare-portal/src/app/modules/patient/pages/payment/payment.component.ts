import { Component } from '@angular/core';

@Component({
  selector: 'app-payment',
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Payment</h1>
      <p class="text-gray-600 mb-6">Manage your billing and payments</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <p class="text-blue-200 text-sm mb-1">Outstanding Balance</p><p class="text-3xl font-bold">245.00 DT</p>
          <button (click)="payNow()" class="mt-4 px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50">Pay Now</button>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <p class="text-gray-500 text-sm mb-1">Total Paid (2024)</p><p class="text-3xl font-bold text-gray-900">1,580.00 DT</p>
          <p class="text-sm text-green-600 mt-2">✓ All previous invoices paid</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <p class="text-gray-500 text-sm mb-1">Insurance Coverage</p><p class="text-3xl font-bold text-gray-900">80%</p>
          <p class="text-sm text-gray-500 mt-2">Blue Cross Blue Shield</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200">
        <div class="p-4 border-b border-gray-200"><h3 class="font-semibold text-gray-900">Recent Transactions</h3></div>
        <div class="divide-y divide-gray-200">
          <div *ngFor="let tx of transactions" class="p-4 flex items-center justify-between hover:bg-gray-50">
            <div class="flex items-center gap-4">
              <div [class]="'w-10 h-10 rounded-lg flex items-center justify-center ' + tx.bgColor"><span>{{tx.icon}}</span></div>
              <div><p class="font-medium text-gray-900">{{tx.description}}</p><p class="text-sm text-gray-500">{{tx.date}}</p></div>
            </div>
            <div class="text-right">
              <p class="font-medium text-gray-900">{{tx.amount}}</p>
              <span [class]="'text-xs font-medium ' + tx.statusColor">{{tx.status}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentComponent {
  transactions = [
    { description: 'Teleconsultation - Dr. Sarah Johnson', date: 'Jan 15, 2024', amount: '95.00 DT', icon: '📹', bgColor: 'bg-blue-50', status: 'Paid', statusColor: 'text-green-600' },
    { description: 'Lab Test - Complete Blood Count', date: 'Jan 10, 2024', amount: '45.00 DT', icon: '🔬', bgColor: 'bg-cyan-50', status: 'Paid', statusColor: 'text-green-600' },
    { description: 'Pharmacy - Amoxicillin', date: 'Jan 8, 2024', amount: '12.99 DT', icon: '💊', bgColor: 'bg-orange-50', status: 'Paid', statusColor: 'text-green-600' },
    { description: 'Specialist Consultation - Dr. Michael Lee', date: 'Jan 5, 2024', amount: '150.00 DT', icon: '👨‍⚕️', bgColor: 'bg-green-50', status: 'Pending', statusColor: 'text-yellow-600' },
    { description: 'MRI Scan - Knee', date: 'Dec 20, 2023', amount: '245.00 DT', icon: '📷', bgColor: 'bg-purple-50', status: 'Pending', statusColor: 'text-yellow-600' }
  ];

  payNow() {
    alert('Redirecting to secure payment gateway...');
  }
}
