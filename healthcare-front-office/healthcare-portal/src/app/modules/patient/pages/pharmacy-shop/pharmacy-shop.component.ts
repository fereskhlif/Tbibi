import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyService, CartItem } from '../../services/pharmacy.service';
import { MedicineResponse } from '../../services/medicine.service';
import { OrderService } from '../../services/order.service';
import { OrderLineService, OrderLineRequest } from '../../services/order-line.service';
import { MainLayoutComponent } from '../../../../shared/layouts/main-layout/main-layout.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-pharmacy-shop',
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold text-gray-900">Pharmacy Shop</h1><p class="text-gray-600">Order medications and health products</p></div>
        <button (click)="showCart = !showCart" class="px-5 py-2.5 bg-blue-600 text-black rounded-lg hover:bg-blue-700 relative flex items-center gap-2 transition-colors">
          🛒 Cart
          <span *ngIf="cartCount > 0" class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">{{cartCount}}</span>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-12">
        <p class="text-gray-500">Loading medicines...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="text-center py-12">
        <p class="text-red-500">{{error}}</p>
        <button (click)="loadMedicines()" class="mt-4 px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700">Retry</button>
      </div>

      <!-- Cart Panel -->
      <div *ngIf="showCart" class="fixed inset-0 z-50 flex justify-end" (click)="showCart = false">
        <div class="absolute inset-0 bg-black/30"></div>
        <div class="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col" (click)="$event.stopPropagation()">
          <div class="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">Shopping Cart</h2>
            <button (click)="showCart = false" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">✕</button>
          </div>
          <div class="flex-1 overflow-auto p-6">
            <div *ngIf="cartItems.length === 0" class="text-center py-12">
              <p class="text-gray-500">Your cart is empty</p>
            </div>
            <div *ngFor="let item of cartItems" class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-3">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">💊</div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 truncate">{{item.medicineName}}</p>
                <p class="text-sm text-blue-600 font-semibold">{{item.price.toFixed(2)}} DT</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold">x{{item.quantity}}</span>
                <button (click)="removeFromCart(item.medicineId)" class="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs hover:bg-red-200">✕</button>
              </div>
            </div>
          </div>
          <div *ngIf="cartItems.length" class="p-6 border-t border-gray-200 bg-gray-50">
            <div class="flex justify-between mb-2 text-sm text-gray-600"><span>Subtotal ({{cartCount}} items)</span><span class="font-semibold text-gray-900">{{cartTotal.toFixed(2)}} DT</span></div>
            <button (click)="checkout()" [disabled]="checkingOut" class="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors disabled:opacity-50">
              {{checkingOut ? 'Processing...' : 'Checkout — ' + cartTotal.toFixed(2) + ' DT'}}
            </button>
          </div>
        </div>
      </div>

      <div class="mb-6 flex gap-4" *ngIf="!loading && !error">
        <input type="text" [(ngModel)]="searchQuery" class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Search medications..." />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="!loading && !error">
        <div *ngFor="let medicine of filteredMedicines" class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group" (click)="viewProduct(medicine.medicineId)">
          <div class="h-32 bg-gray-100 flex items-center justify-center overflow-hidden p-4">
            <span class="text-4xl group-hover:scale-110 transition-transform duration-300">💊</span>
          </div>
          <div class="p-3">
            <div class="mb-1">
              <h3 class="font-semibold text-gray-900 text-sm truncate">{{medicine.medicineName}}</h3>
              <span [class]="'inline-block px-1.5 py-0.5 text-[10px] rounded-full ' + (medicine.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')">
                {{medicine.stock > 0 ? 'In Stock (' + medicine.stock + ')' : 'Out of Stock'}}
              </span>
            </div>
            <div class="flex items-center justify-between mt-2">
              <span class="text-sm font-bold text-blue-600">{{medicine.price.toFixed(2)}} DT</span>
              <button (click)="$event.stopPropagation(); addToCart(medicine)" [disabled]="medicine.stock <= 0" class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed">+</button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !error && filteredMedicines.length === 0" class="text-center py-12">
        <p class="text-gray-500">No medicines found</p>
      </div>
    </div>
  `
})
export class PharmacyShopComponent implements OnInit {
  searchQuery = '';
  showCart = false;
  loading = true;
  error = '';
  checkingOut = false;

  medicines: MedicineResponse[] = [];
  cartItems: CartItem[] = [];
  cartCount = 0;
  cartTotal = 0;

  constructor(
    private router: Router,
    private pharmacyService: PharmacyService,
    private orderService: OrderService,
    private orderLineService: OrderLineService
  ) { }

  ngOnInit() {
    this.loadMedicines();
    this.pharmacyService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartCount = this.pharmacyService.getCartCount();
      this.cartTotal = this.pharmacyService.getCartTotal();
    });
  }

  loadMedicines() {
    this.loading = true;
    this.error = '';
    this.pharmacyService.getMedicines().subscribe({
      next: (data) => {
        this.medicines = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load medicines. Make sure the backend is running.';
        this.loading = false;
        console.error('Error loading medicines:', err);
      }
    });
  }

  get filteredMedicines() {
    return this.medicines.filter(m =>
      !this.searchQuery || m.medicineName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  viewProduct(id: number) {
    this.router.navigate(['/patient/pharmacy-shop/product', id]);
  }

  addToCart(medicine: MedicineResponse) {
    this.pharmacyService.addToCart(medicine);
    MainLayoutComponent.showToast(`${medicine.medicineName} added to cart`, 'success');
  }

  removeFromCart(medicineId: number) {
    this.pharmacyService.removeFromCart(medicineId);
  }

  checkout() {
    if (this.cartItems.length === 0) return;
    this.checkingOut = true;

    // Step 1: Create order lines for each cart item
    const orderLineRequests: OrderLineRequest[] = this.cartItems.map(item => ({
      quantity: item.quantity,
      unitPrice: item.price,
      medicineId: item.medicineId
    }));

    const orderLineObservables = orderLineRequests.map(req => this.orderLineService.create(req));

    forkJoin(orderLineObservables).subscribe({
      next: (createdLines) => {
        // Step 2: Create the order with the created order line IDs
        const orderRequest = {
          deliveryDate: new Date().toISOString(),
          orderDate: new Date().toISOString(),
          totalAmount: this.cartTotal,
          orderStatus: 'CONFIRMED',
          pharmacyId: 1, // Default pharmacy
          userId: 1,     // Default user
          orderLineIds: createdLines.map(line => line.lineId)
        };

        this.orderService.create(orderRequest).subscribe({
          next: (order) => {
            MainLayoutComponent.showToast(`Order #${order.orderId} placed successfully! Total: ${this.cartTotal.toFixed(2)} DT`, 'success');
            this.pharmacyService.clearCart();
            this.showCart = false;
            this.checkingOut = false;
          },
          error: (err) => {
            MainLayoutComponent.showToast('Failed to place order. Please try again.', 'error');
            this.checkingOut = false;
            console.error('Error creating order:', err);
          }
        });
      },
      error: (err) => {
        MainLayoutComponent.showToast('Failed to create order lines. Please try again.', 'error');
        this.checkingOut = false;
        console.error('Error creating order lines:', err);
      }
    });
  }
}
