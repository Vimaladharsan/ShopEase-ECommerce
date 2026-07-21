import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Header } from '../../extras/header/header';
import { CartService } from '../../services/cart';
import { DataService } from '../../services/data';
import { UserService } from '../../services/user';
import { Popup } from '../../extras/popup/popup';
import { CartItem } from '../../models';

const FREE_DELIVERY_ABOVE = 1000;
const DELIVERY_FEE = 49;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    Header,
    Popup
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly dataService = inject(DataService);
  readonly cartService = inject(CartService);

  readonly showPopup = signal(false);
  popupMessage = '';
  popupType = 'success';
  private popupTimer: ReturnType<typeof setTimeout> | undefined;

  // Delivery details — prefilled from the profile
  address = this.userService.currentUser()?.address ?? '';
  paymentMethod = 'Cash on Delivery';

  readonly placing = signal(false);

  readonly deliveryFee = computed(() => {
    const subtotal = this.cartService.totalAmount();
    if (subtotal === 0) return 0;
    return subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  });

  readonly grandTotal = computed(() => this.cartService.totalAmount() + this.deliveryFee());

  showPopupMessage(message: string, type: string = 'success') {
    this.popupType = type;
    this.popupMessage = message;
    this.showPopup.set(true);

    clearTimeout(this.popupTimer);
    this.popupTimer = setTimeout(() => {
      this.showPopup.set(false);
    }, 1800);
  }

  increaseQuantity(item: CartItem) {
    if (!this.cartService.increaseQuantity(item.id)) {
      this.showPopupMessage(`Only ${item.stock} available`, 'error');
    }
  }

  decreaseQuantity(item: CartItem) {
    this.cartService.decreaseQuantity(item.id);
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.id);
    this.showPopupMessage('Item Removed', 'success');
  }

  async placeOrder() {
    if (this.placing()) {
      return;
    }

    const items = this.cartService.cartItems();

    if (items.length === 0) {
      this.showPopupMessage('Your cart is empty', 'error');
      return;
    }

    if (!this.address.trim()) {
      this.showPopupMessage('Please enter a delivery address', 'error');
      return;
    }

    this.placing.set(true);
    const result = await this.userService.placeOrder(items, this.paymentMethod, this.address.trim());
    this.placing.set(false);

    if (!result.success || !result.order) {
      this.showPopupMessage(result.message, 'error');
      // Stock may have changed on the server — refresh the catalog
      this.dataService.refresh();
      return;
    }

    this.cartService.lastPlacedOrder.set(result.order);
    this.cartService.clearCart();
    this.dataService.refresh();

    this.showPopupMessage('Order Placed Successfully', 'success');

    setTimeout(() => {
      this.router.navigate(['/bill']);
    }, 900);
  }
}
