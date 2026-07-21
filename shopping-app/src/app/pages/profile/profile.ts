import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Popup } from '../../extras/popup/popup';
import { UserService } from '../../services/user';
import { CartService } from '../../services/cart';
import { FormsModule } from '@angular/forms';
import { Order, User } from '../../models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, Popup, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly cartService = inject(CartService);

  user: User;
  editedUser: User;

  totalOrders = 0;
  totalSpent = 0;
  totalItems = 0;
  recentOrders: Order[] = [];

  readonly showPopup = signal(false);
  popupMessage = '';
  popupType = 'success';
  private popupTimer: ReturnType<typeof setTimeout> | undefined;

  isEditing = false;

  constructor() {
    // The auth guard guarantees a logged-in user on this route.
    this.user = this.userService.getCurrentUser()!;
    this.editedUser = { ...this.user };
    this.calculateStatistics();
  }

  showPopupMessage(message: string, type: string = 'success') {
    this.popupMessage = message;
    this.popupType = type;
    this.showPopup.set(true);

    clearTimeout(this.popupTimer);
    this.popupTimer = setTimeout(() => {
      this.showPopup.set(false);
    }, 1500);
  }

  calculateStatistics() {
    const history = this.user.purchaseHistory ?? [];

    this.totalOrders = history.length;

    this.totalSpent = history.reduce(
      (sum, order) => sum + order.total,
      0
    );

    this.totalItems = history.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (count, item) => count + item.quantity,
          0
        ),
      0
    );

    this.recentOrders = [...history].reverse().slice(0, 3);
  }

  startEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.editedUser = { ...this.user };
    this.isEditing = false;
  }

  async saveProfile() {
    const saved = await this.userService.updateProfile({
      fullName: this.editedUser.fullName,
      email: this.editedUser.email,
      phone: this.editedUser.phone,
      address: this.editedUser.address
    });

    if (!saved) {
      this.showPopupMessage('Could Not Update Profile', 'error');
      return;
    }

    this.user = this.userService.getCurrentUser()!;
    this.isEditing = false;
    this.showPopupMessage('Profile Updated Successfully');
  }

  logout() {
    this.userService.logout();
    this.cartService.clearCart();
    this.cartService.lastPlacedOrder.set(null);
    this.router.navigate(['/signup']);
  }
}
