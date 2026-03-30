import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PharmacyService, Product } from '../../../services/pharmacy.service';
import { MainLayoutComponent } from '../../../../../shared/layouts/main-layout/main-layout.component';

@Component({
    selector: 'app-product-details',
    template: `
    <div class="p-8" *ngIf="product">
      <button (click)="goBack()" class="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium">
        <span>←</span> Back to Shop
      </button>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2">
          <!-- Image Section -->
          <div class="bg-gray-50 flex items-center justify-center p-12 min-h-[400px]">
            <img *ngIf="product.image" [src]="product.image" [alt]="product.name" class="max-w-full max-h-[400px] object-contain drop-shadow-lg" />
            <span *ngIf="!product.image" class="text-9xl">💊</span>
          </div>

          <!-- Details Section -->
          <div class="p-8 md:p-12 flex flex-col">
            <div class="mb-auto">
              <div class="flex items-center gap-3 mb-4">
                <span [class]="'px-3 py-1 text-sm rounded-full font-medium ' + (product.prescription ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')">
                  {{product.prescription ? 'Prescription Required' : 'Over the Counter'}}
                </span>
                <span class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full font-medium">{{product.category}}</span>
              </div>

              <h1 class="text-4xl font-bold text-gray-900 mb-4">{{product.name}}</h1>
              <p class="text-xl text-gray-600 mb-8 leading-relaxed">{{product.description}}</p>
              
              <div class="text-3xl font-bold text-blue-600 mb-8">{{product.price}}</div>
            </div>

            <div class="flex items-center gap-6 pt-8 border-t border-gray-100">
               <div class="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                 <button (click)="qty = qty > 1 ? qty - 1 : 1" class="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 text-lg transition-colors">−</button>
                 <div class="w-16 h-12 flex items-center justify-center font-bold text-lg border-x border-gray-300">{{qty}}</div>
                 <button (click)="qty = qty + 1" class="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 text-lg transition-colors">+</button>
               </div>

               <button (click)="addToCart()" class="flex-1 h-14 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg shadow-blue-200">
                 Add to Cart
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailsComponent implements OnInit {
    product: Product | undefined;
    qty = 1;

    constructor(
        private route: ActivatedRoute,
        private pharmacyService: PharmacyService,
        private location: Location,
        private router: Router
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.product = this.pharmacyService.getProduct(id);
        }
    }

    goBack() {
        this.router.navigate(['/patient/pharmacy-shop']);
    }

    addToCart() {
        if (this.product) {
            this.pharmacyService.addToCart(this.product, this.qty);
            MainLayoutComponent.showToast(`${this.qty}x ${this.product.name} added to cart`, 'success');
        }
    }
}
