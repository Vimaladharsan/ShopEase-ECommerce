import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { Header } from '../../extras/header/header';
import { CartService } from '../../services/cart';
import { Product } from '../../models';
import { productEmoji } from '../../product-icons';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Header
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails {
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);

  product: Product | null = this.cartService.selectedProduct();
  quantity = 1;
  readonly productEmoji = productEmoji;

  constructor() {
    if (!this.product) {
      this.router.navigate(['/home']);
    }
  }

  increaseQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.product) {
      return;
    }

    if (!this.cartService.addToCart(this.product, this.quantity)) {
      return;
    }
    this.router.navigate(['/checkout']);
  }

  back() {
    this.router.navigate(['/content']);
  }
}
