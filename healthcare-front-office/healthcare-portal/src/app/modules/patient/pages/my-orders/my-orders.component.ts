import { Component, OnInit } from '@angular/core';
import { PatientOrderService, Page } from '../../services/patient-order.service';
import { UserService } from '../../../../services/user.service';
import { OrderResponse } from '../../models/order.model';
import { MainLayoutComponent } from '../../../../shared/layouts/main-layout/main-layout.component';

@Component({
    selector: 'app-my-orders',
    templateUrl: './my-orders.component.html'
})
export class MyOrdersComponent implements OnInit {
    userId: number | null = null;
    
    pagedOrders: OrderResponse[] = [];
    totalElements = 0;
    totalPages = 0;
    loading = true;
    error = '';
    
    selectedOrder: OrderResponse | null = null;
    cancellingOrderId: number | null = null;

    activeTab: string = 'ALL';
    searchQuery = '';
    sortBy = 'newest';

    currentPage = 1;
    readonly pageSize = 10;

    readonly tabs: { key: string; label: string }[] = [
        { key: 'ALL', label: 'All Orders' },
        { key: 'PENDING', label: 'Pending' },
        { key: 'CONFIRMED', label: 'Confirmed' },
        { key: 'IN_PROGRESS', label: 'In Progress' },
        { key: 'DELIVERED', label: 'Delivered' },
        { key: 'CANCELLED', label: 'Cancelled' },
    ];

    constructor(
        private orderService: PatientOrderService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.initUser();
    }

    initUser(): void {
        this.loading = true;
        this.userService.getProfile().subscribe({
            next: (profile) => {
                this.userId = profile.userId;
                this.fetchOrders();
            },
            error: (err) => {
                this.error = 'Failed to identify user account. Please sign in again.';
                this.loading = false;
                console.error(err);
            }
        });
    }

    fetchOrders(): void {
        if (!this.userId) return;
        this.loading = true;
        this.error = '';

        this.orderService.getUserOrdersPaginated(
            this.userId,
            this.activeTab,
            this.searchQuery.trim(),
            this.sortBy,
            this.currentPage - 1,
            this.pageSize
        ).subscribe({
            next: (pageData: Page<OrderResponse>) => {
                this.pagedOrders = pageData.content;
                this.totalPages = pageData.totalPages;
                this.totalElements = pageData.totalElements;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load your orders. Please try again.';
                this.loading = false;
                console.error(err);
            }
        });
    }

    get pageNumbers(): number[] {
        const total = this.totalPages;
        if (total === 0) return [];
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (this.currentPage <= 4) return [1, 2, 3, 4, 5, -1, total];
        if (this.currentPage >= total - 3) return [1, -1, total - 4, total - 3, total - 2, total - 1, total];
        return [1, -1, this.currentPage - 1, this.currentPage, this.currentPage + 1, -1, total];
    }

    selectTab(tab: string): void {
        this.activeTab = tab;
        this.currentPage = 1;
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
                this.cancellingOrderId = null;
                this.closeDetails();
                this.fetchOrders();
            },
            error: (err) => {
                MainLayoutComponent.showToast('Failed to cancel order', 'error');
                this.cancellingOrderId = null;
                console.error(err);
            }
        });
    }
}
