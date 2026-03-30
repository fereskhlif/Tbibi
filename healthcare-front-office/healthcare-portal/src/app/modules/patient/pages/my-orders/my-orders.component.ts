import { Component, OnInit } from '@angular/core';
import { PatientOrderService } from '../../services/patient-order.service';
import { OrderResponse } from '../../models/order.model';
import { MainLayoutComponent } from '../../../../shared/layouts/main-layout/main-layout.component';

@Component({
    selector: 'app-my-orders',
    templateUrl: './my-orders.component.html'
})
export class MyOrdersComponent implements OnInit {
    orders: OrderResponse[] = [];
    loading = true;
    error = '';
    selectedOrder: OrderResponse | null = null;
    cancellingOrderId: number | null = null;

    constructor(private orderService: PatientOrderService) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.loading = true;
        this.orderService.getOrdersByUser(3).subscribe({ // Hardcoded userId 3
            next: (data) => {
                this.orders = data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load your orders. Please try again.';
                this.loading = false;
                console.error(err);
            }
        });
    }

    viewDetails(order: OrderResponse): void {
        this.selectedOrder = order;
    }

    closeDetails(): void {
        this.selectedOrder = null;
    }

    cancelOrder(id: number): void {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        this.cancellingOrderId = id;
        this.orderService.cancelOrder(id).subscribe({
            next: () => {
                MainLayoutComponent.showToast('Order cancelled successfully', 'success');
                this.loadOrders();
                this.cancellingOrderId = null;
                this.closeDetails();
            },
            error: (err) => {
                MainLayoutComponent.showToast('Failed to cancel order', 'error');
                this.cancellingOrderId = null;
                console.error(err);
            }
        });
    }

    getStatusClass(status: string): string {
        switch (status.toUpperCase()) {
            case 'PENDING': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'IN_PROGRESS': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'CANCELLED': return 'bg-gray-50 text-gray-500 border-gray-200';
            case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-200';
        }
    }
}
