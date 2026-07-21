import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Header } from '../../extras/header/header';
import { Popup } from '../../extras/popup/popup';
import { UserService } from '../../services/user';
import { DataService } from '../../services/data';
import { Order } from '../../models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Header,
    Popup
  ],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History {
  private readonly userService = inject(UserService);
  private readonly dataService = inject(DataService);

  readonly orders = signal<Order[]>(this.userService.getPurchaseHistory().slice().reverse());
  readonly loading = signal(true);
  readonly cancelling = signal('');

  readonly showPopup = signal(false);
  popupMessage = '';
  popupType = 'success';
  private popupTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.refresh();
  }

  private async refresh() {
    const orders = await this.userService.fetchOrders();
    this.orders.set(orders.slice().reverse());
    this.loading.set(false);
  }

  showPopupMessage(message: string, type: string = 'success') {
    this.popupType = type;
    this.popupMessage = message;
    this.showPopup.set(true);

    clearTimeout(this.popupTimer);
    this.popupTimer = setTimeout(() => {
      this.showPopup.set(false);
    }, 1800);
  }

  canCancel(order: Order): boolean {
    return order.status === 'Placed' || order.status === 'Processing';
  }

  statusClass(order: Order): string {
    return 'status-' + String(order.status).toLowerCase();
  }

  statusIcon(order: Order): string {
    switch (order.status) {
      case 'Placed': return '🕐';
      case 'Processing': return '📦';
      case 'Shipped': return '🚚';
      case 'Delivered': return '✅';
      case 'Cancelled': return '✕';
      default: return '📦';
    }
  }

  async cancelOrder(order: Order) {
    if (this.cancelling()) {
      return;
    }
    this.cancelling.set(order.orderId);
    const result = await this.userService.cancelOrder(order.orderId);
    this.cancelling.set('');

    if (result.success) {
      this.showPopupMessage('Order cancelled — amount will not be charged', 'success');
      this.dataService.refresh();
      await this.refresh();
    } else {
      this.showPopupMessage(result.message, 'error');
      await this.refresh();
    }
  }
}
