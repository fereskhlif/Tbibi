import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { PatientOrderService } from '../../services/patient-order.service';
import { OrderRequest } from '../../models/order.model';
import { MainLayoutComponent } from '../../../../shared/layouts/main-layout/main-layout.component';
import { PatientMedicineService } from '../../services/patient-medicine.service';
import { Pharmacy } from '../../models/pharmacy.model';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html'
})
export class CheckoutPageComponent implements OnInit {

  isOrdering = false;
  checkoutError = '';
  selectedPharmacy: Pharmacy | null = null;
  pharmacyId: number | null = null;

  constructor(
    public cartService: CartService,
    private orderService: PatientOrderService,
    private medicineService: PatientMedicineService,
    private router: Router
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);

    // Redirect if cart is empty
    const items = this.cartService.getItems();
    if (!items || items.length === 0) {
      this.router.navigate(['/patient/cart']);
      return;
    }

    this.pharmacyId = this.cartService.getPharmacyId();
    if (this.pharmacyId) {
      this.loadPharmacyInfo(this.pharmacyId);
    }
  }

  loadPharmacyInfo(id: number): void {
    // Assuming backend endpoint or finding from loaded lists
    this.medicineService.getPharmacies().subscribe(pharms => {
      this.selectedPharmacy = pharms.find(p => p.pharmacyId === id) || null;
    });
  }

  placeOrder(): void {
    const items = this.cartService.getItems();
    if (!items || items.length === 0) return;
    if (!this.pharmacyId) {
      this.checkoutError = 'Invalid pharmacy detected in cart items.';
      return;
    }

    this.checkoutError = '';
    this.isOrdering = true;

    const request: OrderRequest = {
      userId: 3, // Hardcoded as per spec
      pharmacyId: this.pharmacyId,
      orderLines: items.map(item => ({
        medicineId: item.medicine.medicineId,
        quantity: item.quantity
      }))
    };

    this.orderService.placeOrder(request).subscribe({
      next: (resp) => {
        this.cartService.clearCart();
        this.isOrdering = false;
        // Native success page navigation
        this.router.navigate(['/patient/order-success', resp.orderId]);
      },
      error: (err) => {
        this.isOrdering = false;
        this.checkoutError = err.error?.message || 'Failed to place order. Please review your active cart.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patient/cart']);
  }
}
