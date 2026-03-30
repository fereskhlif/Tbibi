import { Component, OnInit } from '@angular/core';
import { PaymentService, PaymentResponse } from '../../services/payment.service';
import { PaymentHistoryService, PaymentHistoryResponse } from '../../services/payment-history.service';

@Component({
  selector: 'app-payment',
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Payment</h1>
      <p class="text-gray-600 mb-6">Manage your billing and payments</p>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-12"><p class="text-gray-500">Loading payment data...</p></div>

      <!-- Error -->
      <div *ngIf="error" class="text-center py-12">
        <p class="text-red-500">{{error}}</p>
        <button (click)="loadData()" class="mt-4 px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700">Retry</button>
      </div>

      <div *ngIf="!loading && !error">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
            <p class="text-blue-200 text-sm mb-1">Total Payments</p><p class="text-3xl font-bold">{{payments.length}}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <p class="text-gray-500 text-sm mb-1">Payment Histories</p><p class="text-3xl font-bold text-gray-900">{{paymentHistories.length}}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <p class="text-gray-500 text-sm mb-1">Total Amount</p><p class="text-3xl font-bold text-gray-900">{{totalAmount.toFixed(2)}} DT</p>
          </div>
        </div>

        <!-- Create Payment -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 class="font-semibold text-gray-900 mb-4">Make a New Payment</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <input type="date" [(ngModel)]="newPayment.paymentDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select [(ngModel)]="newPayment.paymentMethod" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="CASH">Cash</option>
                <option value="BANK">Bank</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
              </select>
            </div>
            <div class="flex items-end">
              <button (click)="createPayment()" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Payment</button>
            </div>
          </div>
        </div>

        <!-- Payments List -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="p-4 border-b border-gray-200"><h3 class="font-semibold text-gray-900">Recent Payments</h3></div>
          <div *ngIf="payments.length === 0" class="p-8 text-center text-gray-500">No payments found</div>
          <div class="divide-y divide-gray-200">
            <div *ngFor="let payment of payments" class="p-4 flex items-center justify-between hover:bg-gray-50">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50"><span>💳</span></div>
                <div>
                  <p class="font-medium text-gray-900">Payment #{{payment.paymentId}}</p>
                  <p class="text-sm text-gray-500">{{payment.paymentDate}}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{{payment.paymentMethod}}</span>
                <button (click)="deletePayment(payment.paymentId)" class="text-red-500 hover:text-red-700 text-sm">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Histories -->
        <div class="bg-white rounded-xl border border-gray-200 mt-6">
          <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="font-semibold text-gray-900">Payment Histories</h3>
            <button (click)="showCreateHistory = !showCreateHistory" class="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">+ New History</button>
          </div>

          <!-- Create History Form -->
          <div *ngIf="showCreateHistory" class="p-4 border-b border-gray-200 bg-gray-50">
            <div class="flex gap-4 items-end">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount (DT)</label>
                <input type="number" [(ngModel)]="newHistoryAmount" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0.00" />
              </div>
              <button (click)="createPaymentHistory()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Create</button>
            </div>
          </div>

          <div *ngIf="paymentHistories.length === 0" class="p-8 text-center text-gray-500">No payment histories found</div>
          <div class="divide-y divide-gray-200">
            <div *ngFor="let history of paymentHistories" class="p-4 flex items-center justify-between hover:bg-gray-50">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50"><span>📋</span></div>
                <div>
                  <p class="font-medium text-gray-900">History #{{history.historyId}}</p>
                  <p class="text-sm text-gray-500">{{history.paymentIds.length || 0}} payments linked</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span class="font-semibold text-gray-900">{{history.amount.toFixed(2)}} DT</span>
                <button (click)="deletePaymentHistory(history.historyId)" class="text-red-500 hover:text-red-700 text-sm">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentComponent implements OnInit {
  payments: PaymentResponse[] = [];
  paymentHistories: PaymentHistoryResponse[] = [];
  loading = true;
  error = '';
  totalAmount = 0;
  showCreateHistory = false;
  newHistoryAmount = 0;

  newPayment = {
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH'
  };

  constructor(
    private paymentService: PaymentService,
    private paymentHistoryService: PaymentHistoryService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = '';

    this.paymentService.getAll().subscribe({
      next: (data) => {
        this.payments = data;
        this.loadHistories();
      },
      error: (err) => {
        this.error = 'Failed to load payments. Make sure the backend is running.';
        this.loading = false;
        console.error('Error loading payments:', err);
      }
    });
  }

  loadHistories() {
    this.paymentHistoryService.getAll().subscribe({
      next: (data) => {
        this.paymentHistories = data;
        this.totalAmount = data.reduce((sum, h) => sum + h.amount, 0);
        this.loading = false;
      },
      error: (err) => {
        this.paymentHistories = [];
        this.totalAmount = 0;
        this.loading = false;
        console.error('Error loading payment histories:', err);
      }
    });
  }

  createPayment() {
    const request = {
      paymentDate: this.newPayment.paymentDate,
      paymentMethod: this.newPayment.paymentMethod,
      paymentHistoryId: this.paymentHistories.length > 0 ? this.paymentHistories[0].historyId : 1,
      userId: 1
    };

    this.paymentService.create(request).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => console.error('Error creating payment:', err)
    });
  }

  deletePayment(id: number) {
    if (confirm('Are you sure you want to delete this payment?')) {
      this.paymentService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting payment:', err)
      });
    }
  }

  createPaymentHistory() {
    this.paymentHistoryService.create({ amount: this.newHistoryAmount }).subscribe({
      next: () => {
        this.newHistoryAmount = 0;
        this.showCreateHistory = false;
        this.loadData();
      },
      error: (err) => console.error('Error creating payment history:', err)
    });
  }

  deletePaymentHistory(id: number) {
    if (confirm('Are you sure you want to delete this payment history?')) {
      this.paymentHistoryService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting payment history:', err)
      });
    }
  }
}
