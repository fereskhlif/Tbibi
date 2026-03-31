import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PharmacyService } from '../../../services/pharmacy.service';
import { MedicineResponse } from '../../../services/medicine.service';
import { MainLayoutComponent } from '../../../../../shared/layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-product-details',
  template: `
    <!-- Loading -->
    <div class="p-8" *ngIf="loading">
      <p class="text-gray-500 text-center py-12">Loading medicine details...</p>
    </div>

    <!-- Error -->
    <div class="p-8" *ngIf="error">
      <p class="text-red-500 text-center py-12">{{error}}</p>
      <div class="text-center"><button (click)="goBack()" class="px-4 py-2 bg-blue-600 text-black rounded-lg">Back to Shop</button></div>
    </div>

    <div class="p-8" *ngIf="medicine && !loading">
      <button (click)="goBack()" class="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium">
        <span>←</span> Back to Shop
      </button>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2">
          <!-- Image Section -->
          <div class="bg-gray-50 flex items-center justify-center p-12 min-h-[400px]">
            <span class="text-9xl">💊</span>
          </div>

          <!-- Details Section -->
          <div class="p-8 md:p-12 flex flex-col">
            <div class="mb-auto">
              <div class="flex items-center gap-3 mb-4">
                <span [class]="'px-3 py-1 text-sm rounded-full font-medium ' + (medicine.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')">
                  {{medicine.stock > 0 ? 'In Stock (' + medicine.stock + ' units)' : 'Out of Stock'}}
                </span>
              </div>

              <h1 class="text-4xl font-bold text-gray-900 mb-4">{{medicine.medicineName}}</h1>

              <div class="space-y-2 text-gray-600 mb-8">
                <p><strong>Quantity per pack:</strong> {{medicine.quantity}}</p>
                <p><strong>Expiration:</strong> {{medicine.dateOfExpiration | date:'mediumDate'}}</p>
              </div>

              <div class="text-3xl font-bold text-blue-600 mb-8">{{medicine.price.toFixed(2)}} DT</div>
            </div>

            <div class="flex items-center gap-6 pt-8 border-t border-gray-100" *ngIf="medicine.stock > 0">
               <div class="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                 <button (click)="qty = qty > 1 ? qty - 1 : 1" class="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 text-lg transition-colors">−</button>
                 <div class="w-16 h-12 flex items-center justify-center font-bold text-lg border-x border-gray-300">{{qty}}</div>
                 <button (click)="qty = qty < medicine.stock ? qty + 1 : medicine.stock" class="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 text-lg transition-colors">+</button>
               </div>

               <button (click)="addToCart()" class="flex-1 h-14 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg shadow-blue-200">
                 Add to Cart
               </button>
            </div>
            <div *ngIf="medicine.stock <= 0" class="pt-8 border-t border-gray-100">
              <p class="text-red-600 font-medium text-center">This medicine is currently out of stock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailsComponent implements OnInit {
  medicine: MedicineResponse | undefined;
  qty = 1;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private pharmacyService: PharmacyService,
    private router: Router
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pharmacyService.getMedicine(+id).subscribe({
        next: (data) => {
          this.medicine = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load medicine details.';
          this.loading = false;
          console.error('Error loading medicine:', err);
        }
      });
    } else {
      this.error = 'No medicine ID provided.';
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/patient/pharmacy-shop']);
  }

  addToCart() {
    if (this.medicine) {
      this.pharmacyService.addToCart(this.medicine, this.qty);
      MainLayoutComponent.showToast(`${this.qty}x ${this.medicine.medicineName} added to cart`, 'success');
    }
  }
}
