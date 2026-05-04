import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { PatientOrderService } from '../../services/patient-order.service';
import { OrderRequest } from '../../models/order.model';
import { MainLayoutComponent } from '../../../../shared/layouts/main-layout/main-layout.component';
import { PatientMedicineService } from '../../services/patient-medicine.service';
import { UserService, UserProfileDTO } from '../../../../services/user.service';
import { Pharmacy } from '../../models/pharmacy.model';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html'
})
export class CheckoutPageComponent implements OnInit { // UI Refactor Trigger

  isOrdering = false;
  checkoutError = '';
  selectedPharmacy: Pharmacy | null = null;
  pharmacyId: number | null = null;
  userProfile: UserProfileDTO | null = null;

  // New fields for checkout
  deliveryMethod: string = 'PICKUP';
  deliveryAddress: string = '';
  paymentMethod: string = 'CARD';
  prescriptionFile: File | null = null;
  prescriptionBase64: string | null = null;

  constructor(
    public cartService: CartService,
    private orderService: PatientOrderService,
    private medicineService: PatientMedicineService,
    private userService: UserService,
    private paymentService: PaymentService,
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

    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        if (profile.adresse) {
          this.deliveryAddress = profile.adresse;
        }
      },
      error: (err) => console.error('Failed to load user profile during checkout:', err)
    });
  }

  loadPharmacyInfo(id: number): void {
    // Assuming backend endpoint or finding from loaded lists
    this.medicineService.getPharmacies().subscribe(pharms => {
      this.selectedPharmacy = pharms.find(p => p.pharmacyId === id) || null;
    });
  }

  getFirstImage(medicine: any): string {
    return medicine.imageUrls && medicine.imageUrls.length > 0
      ? medicine.imageUrls[0]
      : 'assets/images/placeholder-medicine.png';
  }

  handlePrescriptionUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.prescriptionFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.prescriptionBase64 = reader.result as string;
      };
      reader.readAsDataURL(this.prescriptionFile);
    }
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
      userId: this.userProfile?.userId || 3, // Fallback to 3 if profile not loaded yet, but ideally it should be loaded
      pharmacyId: this.pharmacyId,
      deliveryMethod: this.deliveryMethod,
      deliveryAddress: this.deliveryMethod === 'DELIVERY' ? this.deliveryAddress : '',
      paymentMethod: this.paymentMethod,
      prescriptionImage: this.prescriptionBase64 || undefined,
      orderLines: items.map(item => ({
        medicineId: item.medicine.medicineId,
        quantity: item.quantity
      }))
    };

    this.orderService.placeOrder(request).subscribe({
      next: (resp) => {
        if (this.paymentMethod === 'CARD') {
          this.initiateStripePayment(resp.orderId);
        } else {
          this.cartService.clearCart();
          this.isOrdering = false;
          this.router.navigate(['/patient/order-success', resp.orderId]);
        }
      },
      error: (err) => {
        this.isOrdering = false;
        this.checkoutError = err.error?.message || 'Failed to place order. Please review your active cart.';
      }
    });
  }

  private initiateStripePayment(orderId: number): void {
    const amount = Math.round(this.cartService.getTotalAmount() * 100); // Stripe expects cents
    const request = {
      amount: amount,
      currency: 'usd', // Usually USD or TND if configured, using USD for demo
      productName: 'Pharmacy Order #' + orderId,
      successUrl: window.location.origin + '/patient/order-success/' + orderId,
      cancelUrl: window.location.origin + '/patient/checkout',
      orderId: orderId
    };

    this.paymentService.createCheckoutSession(request).subscribe({
      next: (resp) => {
        this.cartService.clearCart();
        window.location.href = resp.sessionUrl; // Redirect to Stripe
      },
      error: (err) => {
        this.isOrdering = false;
        this.checkoutError = 'Order created, but failed to initiate Stripe payment. You can pay at pickup instead.';
        console.error('Stripe error:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patient/cart']);
  }
}
