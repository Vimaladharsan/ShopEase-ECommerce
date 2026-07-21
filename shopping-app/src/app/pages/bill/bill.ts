import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { CartService } from '../../services/cart';
import { UserService } from '../../services/user';
import { Order } from '../../models';

@Component({
  selector: 'app-bill',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bill.html',
  styleUrl: './bill.css'
})
export class Bill {
  private readonly router = inject(Router);

  readonly order: Order | null = inject(CartService).lastPlacedOrder();
  readonly username = inject(UserService).username();

  constructor() {
    if (!this.order) {
      this.router.navigate(['/home']);
    }
  }

  backToHome() {
    this.router.navigate(['/home']);
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }
}
