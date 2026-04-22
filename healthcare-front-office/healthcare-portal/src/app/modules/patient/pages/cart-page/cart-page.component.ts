import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html'
})
export class CartPageComponent implements OnInit {

  constructor(
    public cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Scroll to top when landing on the page
    window.scrollTo(0, 0);
  }

  getFirstImage(medicine: any): string {
    return medicine.imageUrls && medicine.imageUrls.length > 0
      ? medicine.imageUrls[0]
      : 'assets/images/placeholder-medicine.png';
  }

  continueShopping(): void {
    this.router.navigate(['/patient/medicine-catalog']);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  proceedToCheckout(): void {
    this.router.navigate(['/patient/checkout']);
  }
}
