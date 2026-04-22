import { Component, OnInit } from '@angular/core';
import { PharmacistOrder, OrderStatus } from '../../models/pharmacist-order.model';
import { PharmacistOrderService, Page } from '../../services/pharmacist-order.service';
import { MainLayoutComponent } from '../../../../shared/layouts/main-layout/main-layout.component';

@Component({
    selector: 'app-order-management',
    templateUrl: './order-management.component.html'
})
export class OrderManagementComponent implements OnInit {
    readonly PHARMACY_ID = 1;

    pagedOrders: PharmacistOrder[] = [];
    totalElements = 0;
    totalPages = 0;
    loading = true;
    error = '';

    // Default to PENDING
    activeTab: OrderStatus | 'ALL' = 'PENDING';
    updatingOrderId: number | null = null;
    expandedOrderId: number | null = null;

    // Search & Sort
    searchQuery = '';
    sortBy = 'newest';

    // Bulk Selection
    selectedOrderIds = new Set<number>();

    // Refresh timestamp
    lastFetched: Date | null = null;

    // Pagination
    currentPage = 1;
    readonly pageSize = 10;
    
    get pageNumbers(): number[] {
        const total = this.totalPages;
        if (total === 0) return [];
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
        isBulk: boolean;
    } = { visible: false, orderId: null, newStatus: null, message: '', isBulk: false };

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
        this.fetchOrders();
    }

    fetchOrders(): void {
        this.loading = true;
        this.error = '';
        
        this.orderService.getOrdersPaginated(
            this.PHARMACY_ID,
            this.activeTab,
            this.searchQuery.trim(),
            this.sortBy,
            this.currentPage - 1, // backend is 0-indexed
            this.pageSize
        ).subscribe({
            next: (pageData: Page<PharmacistOrder>) => {
                this.pagedOrders = pageData.content;
                this.totalPages = pageData.totalPages;
                this.totalElements = pageData.totalElements;
                this.lastFetched = new Date();
                this.loading = false;
            },
            error: (err) => {
                this.error = err.error?.message || err.message || 'Failed to load orders.';
                this.loading = false;
            }
        });
    }

    selectTab(tab: OrderStatus | 'ALL'): void {
        this.activeTab = tab;
        this.currentPage = 1;
        this.selectedOrderIds.clear();
        this.fetchOrders();
    }

    onSearchChange(): void {
        this.currentPage = 1;
        this.fetchOrders();
    }

    onSortChange(): void {
        this.currentPage = 1;
        this.fetchOrders();
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.fetchOrders();
    }

    // ─── Bulk Selection ─────────────────────────────────────
    get selectableOrders(): PharmacistOrder[] {
        return this.pagedOrders.filter(o => o.orderStatus === 'PENDING');
    }

    get allSelectableChecked(): boolean {
        const selectable = this.selectableOrders;
        return selectable.length > 0 && selectable.every(o => this.selectedOrderIds.has(o.orderId));
    }

    toggleSelectOrder(orderId: number): void {
        if (this.selectedOrderIds.has(orderId)) {
            this.selectedOrderIds.delete(orderId);
        } else {
            this.selectedOrderIds.add(orderId);
        }
    }

    toggleSelectAll(): void {
        if (this.allSelectableChecked) {
            this.selectableOrders.forEach(o => this.selectedOrderIds.delete(o.orderId));
        } else {
            this.selectableOrders.forEach(o => this.selectedOrderIds.add(o.orderId));
        }
    }

    openBulkConfirmDialog(newStatus: OrderStatus): void {
        const count = this.selectedOrderIds.size;
        const action = newStatus === 'CONFIRMED' ? 'confirm' : 'reject';
        this.confirmDialog = {
            visible: true,
            orderId: null,
            newStatus,
            message: `Are you sure you want to ${action} ${count} selected order${count > 1 ? 's' : ''}?`,
            isBulk: true,
        };
    }

    executeBulkAction(): void {
        if (!this.confirmDialog.newStatus) return;
        const status = this.confirmDialog.newStatus;
        const ids = [...this.selectedOrderIds];
        this.cancelDialog();

        let completed = 0;
        ids.forEach(id => {
            this.orderService.updateOrderStatus(id, status).subscribe({
                next: () => {
                    completed++;
                    if (completed === ids.length) {
                        this.selectedOrderIds.clear();
                        const action = status === 'CONFIRMED' ? 'confirmed' : 'rejected';
                        MainLayoutComponent.showToast(`${ids.length} order(s) ${action} successfully.`, status === 'REJECTED' ? 'error' : 'success');
                        this.fetchOrders();
                    }
                },
                error: (err) => {
                    completed++;
                    MainLayoutComponent.showToast(`Failed to update order #${id}`, 'error');
                    if (completed === ids.length) {
                        this.fetchOrders();
                    }
                }
            });
        });
    }

    // ─── Single Order Actions ────────────────────────────────
    openConfirmDialog(orderId: number, newStatus: OrderStatus, message: string): void {
        this.confirmDialog = { visible: true, orderId, newStatus, message, isBulk: false };
    }

    cancelDialog(): void {
        this.confirmDialog = { visible: false, orderId: null, newStatus: null, message: '', isBulk: false };
    }

    confirmAction(): void {
        if (this.confirmDialog.isBulk) {
            this.executeBulkAction();
            return;
        }
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
                this.selectedOrderIds.delete(orderId);
                
                const msgs: Partial<Record<OrderStatus, string>> = {
                    CONFIRMED: 'Order confirmed successfully.',
                    REJECTED: 'Order rejected.',
                    IN_PROGRESS: 'Order marked as in progress.',
                    DELIVERED: 'Order delivered successfully.',
                };
                MainLayoutComponent.showToast(msgs[newStatus] || 'Order status updated.', newStatus === 'REJECTED' ? 'error' : 'success');
                this.fetchOrders();
            },
            error: (err) => {
                this.updatingOrderId = null;
                MainLayoutComponent.showToast(err.error?.message || 'Failed to update order status.', 'error');
            }
        });
    }

    quickConfirm(orderId: number, event: Event): void {
        event.stopPropagation();
        this.openConfirmDialog(orderId, 'CONFIRMED', 'Confirm this order?');
    }

    quickReject(orderId: number, event: Event): void {
        event.stopPropagation();
        this.openConfirmDialog(orderId, 'REJECTED', 'Reject this order?');
    }

    quickProgress(orderId: number, event: Event): void {
        event.stopPropagation();
        this.openConfirmDialog(orderId, 'IN_PROGRESS', 'Mark as In Progress?');
    }

    quickDeliver(orderId: number, event: Event): void {
        event.stopPropagation();
        this.openConfirmDialog(orderId, 'DELIVERED', 'Mark as Delivered?');
    }

    openDetail(order: PharmacistOrder): void {
        this.selectedOrder = order;
    }

    closeDetail(): void {
        this.selectedOrder = null;
    }

    refreshOrders(): void {
        this.fetchOrders();
    }

    getTimeSinceRefresh(): string {
        if (!this.lastFetched) return '';
        const seconds = Math.floor((Date.now() - this.lastFetched.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ago`;
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
