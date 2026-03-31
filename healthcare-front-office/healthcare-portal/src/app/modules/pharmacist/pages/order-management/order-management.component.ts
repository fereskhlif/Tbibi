import { Component, OnInit } from '@angular/core';
import { PharmacistOrder, OrderStatus } from '../../models/pharmacist-order.model';
import { PharmacistOrderService } from '../../services/pharmacist-order.service';
import { MainLayoutComponent } from '../../../../shared/layouts/main-layout/main-layout.component';

@Component({
    selector: 'app-order-management',
    templateUrl: './order-management.component.html'
})
export class OrderManagementComponent implements OnInit {
    readonly PHARMACY_ID = 1;

    allOrders: PharmacistOrder[] = [];
    filteredOrders: PharmacistOrder[] = [];
    loading = true;
    error = '';

    activeTab: OrderStatus | 'ALL' = 'ALL';
    updatingOrderId: number | null = null;
    expandedOrderId: number | null = null;

    // Pagination
    currentPage = 1;
    readonly pageSize = 10;
    get totalPages(): number { return Math.ceil(this.filteredOrders.length / this.pageSize); }
    get pagedOrders(): PharmacistOrder[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredOrders.slice(start, start + this.pageSize);
    }
    get pageNumbers(): number[] {
        const total = this.totalPages;
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (this.currentPage <= 4) return [1, 2, 3, 4, 5, -1, total];
        if (this.currentPage >= total - 3) return [1, -1, total - 4, total - 3, total - 2, total - 1, total];
        return [1, -1, this.currentPage - 1, this.currentPage, this.currentPage + 1, -1, total];
    }

    // Confirmation dialog state
    confirmDialog: {
        visible: boolean;
        orderId: number | null;
        newStatus: OrderStatus | null;
        message: string;
    } = { visible: false, orderId: null, newStatus: null, message: '' };

    selectedOrder: PharmacistOrder | null = null;

    readonly tabs: { key: OrderStatus | 'ALL'; label: string }[] = [
        { key: 'ALL', label: 'All Orders' },
        { key: 'PENDING', label: 'Pending' },
        { key: 'CONFIRMED', label: 'Confirmed' },
        { key: 'IN_PROGRESS', label: 'In Progress' },
        { key: 'DELIVERED', label: 'Delivered' },
        { key: 'REJECTED', label: 'Rejected' },
    ];

    constructor(private orderService: PharmacistOrderService) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.loading = true;
        this.error = '';
        this.orderService.getOrdersByPharmacy(this.PHARMACY_ID).subscribe({
            next: (data) => {
                this.allOrders = data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
                this.applyFilter();
                this.loading = false;
            },
            error: (err) => {
                this.error = err.message || 'Failed to load orders.';
                this.loading = false;
            }
        });
    }

    selectTab(tab: OrderStatus | 'ALL'): void {
        this.activeTab = tab;
        this.currentPage = 1;
        this.applyFilter();
    }

    applyFilter(): void {
        if (this.activeTab === 'ALL') {
            this.filteredOrders = [...this.allOrders];
        } else {
            this.filteredOrders = this.allOrders.filter(o => o.orderStatus === this.activeTab);
        }
        this.currentPage = 1;
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
    }

    getCount(status: OrderStatus | 'ALL'): number {
        if (status === 'ALL') return this.allOrders.length;
        return this.allOrders.filter(o => o.orderStatus === status).length;
    }

    openConfirmDialog(orderId: number, newStatus: OrderStatus, message: string): void {
        this.confirmDialog = { visible: true, orderId, newStatus, message };
    }

    cancelDialog(): void {
        this.confirmDialog = { visible: false, orderId: null, newStatus: null, message: '' };
    }

    confirmAction(): void {
        if (!this.confirmDialog.orderId || !this.confirmDialog.newStatus) return;
        const { orderId, newStatus } = this.confirmDialog;
        this.cancelDialog();
        this.changeStatus(orderId, newStatus);
    }

    changeStatus(orderId: number, newStatus: OrderStatus): void {
        this.updatingOrderId = orderId;
        this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
            next: () => {
                this.updatingOrderId = null;
                // Update in-memory
                const order = this.allOrders.find(o => o.orderId === orderId);
                if (order) order.orderStatus = newStatus;
                if (this.selectedOrder?.orderId === orderId) this.selectedOrder.orderStatus = newStatus;
                this.applyFilter();

                const msgs: Partial<Record<OrderStatus, string>> = {
                    CONFIRMED: 'Order confirmed successfully.',
                    REJECTED: 'Order rejected.',
                    IN_PROGRESS: 'Order marked as in progress.',
                    DELIVERED: 'Order delivered successfully.',
                };
                MainLayoutComponent.showToast(msgs[newStatus] || 'Order status updated.', newStatus === 'REJECTED' ? 'error' : 'success');
            },
            error: (err) => {
                this.updatingOrderId = null;
                MainLayoutComponent.showToast(err.error?.message || 'Failed to update order status.', 'error');
            }
        });
    }

    openDetail(order: PharmacistOrder): void {
        this.selectedOrder = order;
    }

    closeDetail(): void {
        this.selectedOrder = null;
    }

    getStatusClass(status: string): string {
        const map: Record<string, string> = {
            PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
            IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200',
            DELIVERED: 'bg-green-50 text-green-700 border-green-200',
            CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
            REJECTED: 'bg-red-50 text-red-600 border-red-200',
        };
        return map[status] || 'bg-gray-100 text-gray-500 border-gray-200';
    }

    getTabClass(tab: OrderStatus | 'ALL'): string {
        const active = this.activeTab === tab;
        const colorMap: Partial<Record<OrderStatus | 'ALL', string>> = {
            ALL: active ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50',
            PENDING: active ? 'bg-yellow-500 text-white' : 'bg-white text-yellow-600 hover:bg-yellow-50 border border-yellow-200',
            CONFIRMED: active ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200',
            IN_PROGRESS: active ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-200',
            DELIVERED: active ? 'bg-green-600 text-white' : 'bg-white text-green-600 hover:bg-green-50 border border-green-200',
            REJECTED: active ? 'bg-red-600 text-white' : 'bg-white text-red-600 hover:bg-red-50 border border-red-200',
        };
        return colorMap[tab] || 'bg-white text-gray-600';
    }
}
