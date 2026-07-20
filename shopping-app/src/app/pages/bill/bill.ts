import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { CartService } from '../../services/cart';
import { UserService } from '../../services/user';
import { CartItem } from '../../models';

@Component({
  selector: 'app-bill',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bill.html',
  styleUrl: './bill.css'
})
export class Bill {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);

  readonly orderedItems: CartItem[] = this.cartService.lastOrder();
  readonly totalAmount = this.cartService.lastTotal();
  readonly username = inject(UserService).username();
  readonly orderId = this.cartService.lastOrderId();
  readonly currentDate = new Date();

  constructor() {
    if (this.orderedItems.length === 0) {
      this.router.navigate(['/home']);
    }
  }

  backToHome() {
    this.router.navigate(['/home']);
  }
}
