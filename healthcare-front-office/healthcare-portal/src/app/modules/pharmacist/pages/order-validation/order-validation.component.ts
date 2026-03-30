import { Component, OnInit } from '@angular/core';
import { OrderService, OrderResponse, OrderRequest } from '../../../patient/services/order.service';

@Component({
  selector: 'app-order-validation',
  template: `
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Order Validation</h1><p class="text-gray-600 mb-6">Review and validate incoming orders</p>

    <!-- Loading -->
    <div *ngIf="loading" class="text-center py-12"><p class="text-gray-500">Loading orders...</p></div>

    <!-- Error -->
    <div *ngIf="error" class="text-center py-12">
      <p class="text-red-500">{{error}}</p>
      <button (click)="loadOrders()" class="mt-4 px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700">Retry</button>
    </div>

    <div *ngIf="!loading && !error">
      <div *ngIf="orders.length === 0" class="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p class="text-gray-500">No orders found</p>
      </div>

      <div class="space-y-4">
        <div *ngFor="let order of orders" class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-semibold text-gray-900">Order #{{order.orderId}}</h3>
              <p class="text-sm text-gray-500">User #{{order.userId}} • {{order.orderDate | date:'mediumDate'}} • Pharmacy: {{order.pharmacyName || 'N/A'}}</p>
            </div>
            <span [class]="'px-3 py-1 text-xs rounded-full ' + getStatusClass(order.orderStatus)">{{order.orderStatus}}</span>
          </div>

          <!-- Order Lines -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div *ngIf="order.orderLines && order.orderLines.length > 0">
              <div *ngFor="let line of order.orderLines" class="flex justify-between py-1 text-sm">
                <span class="text-gray-700">{{line.medicineName || 'Medicine #' + line.medicineId}} (x{{line.quantity}})</span>
                <span class="text-gray-900 font-medium">{{line.unitPrice.toFixed(2)}} DT</span>
              </div>
            </div>
            <div *ngIf="!order.orderLines || order.orderLines.length === 0" class="text-sm text-gray-500">No order lines</div>
            <div class="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
              <span>Total</span><span>{{order.totalAmount.toFixed(2)}} DT</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2" *ngIf="order.orderStatus === 'CONFIRMED'">
            <button (click)="updateOrderStatus(order, 'DELIVERED')" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Mark Delivered</button>
            <button (click)="updateOrderStatus(order, 'CANCELLED')" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Cancel</button>
          </div>
          <div class="flex gap-2" *ngIf="order.orderStatus === 'DELIVERED'">
            <span class="text-sm text-green-600 font-medium">✓ Delivered</span>
          </div>
          <div class="flex gap-2" *ngIf="order.orderStatus === 'CANCELLED'">
            <span class="text-sm text-red-600 font-medium">✕ Cancelled</span>
          </div>

          <!-- Delete -->
          <div class="mt-3 pt-3 border-t border-gray-100">
            <button (click)="deleteOrder(order.orderId)" class="text-sm text-red-500 hover:text-red-700">Delete Order</button>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class OrderValidationComponent implements OnInit {
  orders: OrderResponse[] = [];
  loading = true;
  error = '';

  constructor(private orderService: OrderService) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.error = '';
    this.orderService.getAll().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load orders. Make sure the backend is running.';
        this.loading = false;
        console.error('Error loading orders:', err);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'bg-yellow-100 text-yellow-700';
      case 'DELIVERED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  updateOrderStatus(order: OrderResponse, newStatus: string) {
    const request: OrderRequest = {
      deliveryDate: order.deliveryDate,
      orderDate: order.orderDate,
      totalAmount: order.totalAmount,
      orderStatus: newStatus,
      pharmacyId: order.pharmacyId,
      userId: order.userId,
      orderLineIds: order.orderLines ? order.orderLines.map(l => l.lineId) : []
    };

    this.orderService.update(order.orderId, request).subscribe({
      next: () => this.loadOrders(),
      error: (err) => console.error('Error updating order:', err)
    });
  }

  deleteOrder(id: number) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.delete(id).subscribe({
        next: () => this.loadOrders(),
        error: (err) => console.error('Error deleting order:', err)
      });
    }
  }
}
