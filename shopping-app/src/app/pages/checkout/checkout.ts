import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../../extras/header/header';
import { CartService } from '../../services/cart';
import { DataService } from '../../services/data';
import { UserService } from '../../services/user';
import { Popup } from '../../extras/popup/popup';
import { CartItem, Order } from '../../models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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

  showPopupMessage(message: string, type: string = 'success') {
    this.popupType = type;
    this.popupMessage = message;
    this.showPopup.set(true);

    clearTimeout(this.popupTimer);
    this.popupTimer = setTimeout(() => {
      this.showPopup.set(false);
    }, 1000);
  }

  increaseQuantity(item: CartItem) {
    if (!this.cartService.increaseQuantity(item.id)) {
      this.showPopupMessage('Not Enough Stock', 'error');
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
    const items = this.cartService.cartItems();

    if (items.length === 0) {
      this.showPopupMessage('Cart Is Empty', 'error');
      return;
    }

    const total = this.cartService.totalAmount();

    const order: Order = {
      orderId: 'ORD' + Math.floor(Math.random() * 1000000),
      items: [...items],
      total: total,
      date: new Date(),
      status: 'Delivered'
    };

    const saved = await this.userService.addPurchase(order);
    if (!saved) {
      this.showPopupMessage('Could Not Place Order', 'error');
      return;
    }

    this.cartService.lastOrder.set([...items]);
    this.cartService.lastTotal.set(total);
    this.cartService.lastOrderId.set(order.orderId);
    this.cartService.clearCart();

    // Sync catalog stock with what the server just recorded
    this.dataService.refresh();

    this.showPopupMessage('Order Placed Successfully', 'success');

    setTimeout(() => {
      this.router.navigate(['/bill']);
    }, 1000);
  }
}
