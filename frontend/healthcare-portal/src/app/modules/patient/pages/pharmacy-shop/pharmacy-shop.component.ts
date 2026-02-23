import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyService, Product, CartItem } from '../../services/pharmacy.service';
import { MainLayoutComponent } from '../../../../shared/layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-pharmacy-shop',
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <div><h1 class="text-2xl font-bold text-gray-900">Pharmacy Shop</h1><p class="text-gray-600">Order medications and health products</p></div>
        <button (click)="showCart = !showCart" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 relative flex items-center gap-2 transition-colors">
          🛒 Cart
          <span *ngIf="cartCount > 0" class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">{{cartCount}}</span>
        </button>
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
              <lucide-icon name="shopping-bag" class="w-16 h-16 text-gray-300 mx-auto mb-4"></lucide-icon>
              <p class="text-gray-500">Your cart is empty</p>
            </div>
            <div *ngFor="let item of cartItems" class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-3">
              <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img *ngIf="item.image" [src]="item.image" class="w-full h-full object-cover" />
                <div *ngIf="!item.image" class="text-gray-500"><lucide-icon name="pill" class="w-6 h-6"></lucide-icon></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 truncate">{{item.name}}</p>
                <p class="text-sm text-blue-600 font-semibold">{{item.price}}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold">x{{item.qty}}</span>
              </div>
            </div>
          </div>
          <div *ngIf="cartItems.length" class="p-6 border-t border-gray-200 bg-gray-50">
            <div class="flex justify-between mb-2 text-sm text-gray-600"><span>Subtotal ({{cartCount}} items)</span><span class="font-semibold text-gray-900">{{cartTotal.toFixed(2)}} DT</span></div>
            <button (click)="checkout()" class="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors">Checkout — {{cartTotal.toFixed(2)}} DT</button>
          </div>
        </div>
      </div>

      <div class="mb-6 flex gap-4">
        <input type="text" [(ngModel)]="searchQuery" class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Search medications..." />
        <select [(ngModel)]="selectedCategory" class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option *ngFor="let cat of categories" [value]="cat">{{cat}}</option>
        </select>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let product of filteredProducts" class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group" (click)="viewProduct(product.id)">
          <div class="h-32 bg-gray-100 flex items-center justify-center overflow-hidden p-4">
            <img [src]="product.image" [alt]="product.name" class="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300" *ngIf="product.image" />
            <div *ngIf="!product.image" class="text-gray-400"><lucide-icon name="pill" class="w-12 h-12"></lucide-icon></div>
          </div>
          <div class="p-3">
            <div class="mb-1">
              <h3 class="font-semibold text-gray-900 text-sm truncate">{{product.name}}</h3>
              <span [class]="'inline-block px-1.5 py-0.5 text-[10px] rounded-full ' + (product.prescription ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')">
                {{product.prescription ? 'Rx' : 'OTC'}}
              </span>
            </div>
            <div class="flex items-center justify-between mt-2">
              <span class="text-sm font-bold text-blue-600">{{product.price}}</span>
              <button (click)="$event.stopPropagation(); addToCart(product)" class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors font-bold text-lg">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PharmacyShopComponent implements OnInit {
  searchQuery = '';
  selectedCategory = 'All';
  showCart = false;
  categories = ['All', 'Pain Relief', 'Antibiotics', 'Vitamins', 'Allergy', 'Digestive'];

  products: Product[] = [];
  cartItems: CartItem[] = [];
  cartCount = 0;
  cartTotal = 0;

  constructor(
    private router: Router,
    private pharmacyService: PharmacyService
  ) { }

  ngOnInit() {
    this.products = this.pharmacyService.getProducts();
    this.pharmacyService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartCount = this.pharmacyService.getCartCount();
      this.cartTotal = this.pharmacyService.getCartTotal();
    });
  }

  get filteredProducts() {
    return this.products.filter(p =>
      (this.selectedCategory === 'All' || p.category === this.selectedCategory) &&
      (!this.searchQuery || p.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }

  viewProduct(id: string) {
    this.router.navigate(['/patient/pharmacy-shop/product', id]);
  }

  addToCart(product: Product) {
    this.pharmacyService.addToCart(product);
    MainLayoutComponent.showToast(`${product.name} added to cart`, 'success');
  }

  checkout() {
    alert(`Order for ${this.cartTotal.toFixed(2)} DT placed successfully!`);
    // Logic to clear cart would go here in a real app, typically handled by the service.
    // For now, we'll just close the cart to simulate completion.
    this.showCart = false;
  }
}
