import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Header } from '../../extras/header/header';
import { CartService } from '../../services/cart';
import { Popup } from '../../extras/popup/popup';
import { Product } from '../../models';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Header,
    Popup
  ],
  templateUrl: './content.html',
  styleUrl: './content.css'
})
export class Content {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);

  readonly showPopup = signal(false);
  popupMessage = '';
  popupType = 'success';
  private popupTimer: ReturnType<typeof setTimeout> | undefined;

  products: Product[] = [];
  categoryName = '';
  quantities: Record<number, number> = {};

  constructor() {
    const selectedCategory = this.cartService.selectedCategory();

    if (selectedCategory) {
      this.categoryName = selectedCategory.name;
      this.products = selectedCategory.products;
    }

    for (const product of this.products) {
      this.quantities[product.id] = 1;
    }
  }

  showPopupMessage(message: string, type: string = 'success') {
    this.popupType = type;
    this.popupMessage = message;
    this.showPopup.set(true);

    clearTimeout(this.popupTimer);
    this.popupTimer = setTimeout(() => {
      this.showPopup.set(false);
    }, 1000);
  }

  increaseQuantity(product: Product) {
    if (this.quantities[product.id] < product.stock) {
      this.quantities[product.id]++;
    } else {
      this.showPopupMessage('Not Enough Stock', 'error');
    }
  }

  decreaseQuantity(product: Product) {
    if (this.quantities[product.id] > 1) {
      this.quantities[product.id]--;
    }
  }

  addToCart(product: Product) {
    const quantity = this.quantities[product.id];

    if (product.stock < quantity) {
      this.showPopupMessage('Not Enough Stock', 'error');
      return;
    }

    product.stock -= quantity;
    this.cartService.addToCart(product, quantity);

    this.showPopupMessage('Item Added To Cart', 'success');
    this.quantities[product.id] = 1;
  }

  viewProduct(product: Product) {
    this.cartService.selectedProduct.set(product);
    this.router.navigate(['/product-details']);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
