import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { Header } from '../../extras/header/header';
import { CartService } from '../../services/cart';
import { UserService } from '../../services/user';

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

  product: any;

  quantity = 1;

  constructor(
    public cartService: CartService,
    private userService: UserService,
    private router: Router
  ) {

    if (!this.userService.username) {
      this.router.navigate(['/signup']);
      return;
    }

    this.product = this.cartService.selectedProduct;

    if (!this.product) {
      this.router.navigate(['/home']);
    }

  }

  increaseQuantity() {

    if (this.quantity < this.product.stock) {
      this.quantity++;
    }

  }

  decreaseQuantity() {

    if (this.quantity > 1) {
      this.quantity--;
    }

  }

  addToCart() {

    this.cartService.addToCart(
      this.product,
      this.quantity
    );

    this.product.stock -= this.quantity;

    this.router.navigate(['/checkout']);

  }

  back() {

    this.router.navigate(['/content']);

  }

}