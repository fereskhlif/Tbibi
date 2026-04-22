import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styles: [`
    .animate-scale {
      animation: scalePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes scalePop {
      0% { opacity: 0; transform: scale(0.5); }
      100% { opacity: 1; transform: scale(1); }
    }
  `]
})
export class OrderSuccessComponent implements OnInit {

  orderId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.orderId = this.route.snapshot.paramMap.get('orderId');
  }

  trackOrder(): void {
    this.router.navigate(['/patient/my-orders']);
  }

  continueShopping(): void {
    this.router.navigate(['/patient/medicine-catalog']);
  }
}
