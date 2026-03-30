import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Medicine } from '../../models/medicine.model';
import { PatientMedicineService } from '../../services/patient-medicine.service';
import { CartService } from '../../services/cart.service';
import { MainLayoutComponent } from '../../../../shared/layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-medicine-details',
  templateUrl: './medicine-details.component.html'
})
export class MedicineDetailsComponent implements OnInit {
  medicine: Medicine | null = null;
  loading = true;
  error = '';
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private medicineService: PatientMedicineService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadMedicine(+id);
      } else {
        this.error = 'No medicine ID provided.';
        this.loading = false;
      }
    });
  }

  loadMedicine(id: number): void {
    this.loading = true;
    this.medicineService.getById(id).subscribe({
      next: (data) => {
        this.medicine = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load medicine details.';
        this.loading = false;
        console.error('Error fetching medicine:', err);
      }
    });
  }

  increaseQuantity(): void {
    if (this.medicine && this.quantity < this.medicine.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.medicine) {
      this.cartService.addToCart(this.medicine, this.quantity);
      MainLayoutComponent.showToast(`${this.medicine.medicineName} added to cart`, 'success');
    }
  }

  goBack(): void {
    window.history.back();
  }

  getFirstImage(): string {
    return this.medicine?.imageUrls && this.medicine.imageUrls.length > 0
      ? this.medicine.imageUrls[0]
      : 'assets/images/placeholder-medicine.png';
  }

  formatForm(form?: string): string {
    if (!form) return '';
    return form.charAt(0).toUpperCase() + form.slice(1).toLowerCase().replace('_', ' ');
  }
}
