import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Popup } from '../../extras/popup/popup';
import { UserService } from '../../services/user';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule,Popup],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {

  user: any = {};

  totalOrders = 0;
  totalSpent = 0;
  totalItems = 0;

  recentOrders: any[] = [];
  showPopup = false;

popupMessage = '';

popupType = 'success';

popupTimer: any;
isEditing = false;

editedUser: any = {};
  constructor(
    private userService: UserService,
    private cartService: CartService,
    private router: Router
  ) {

    const currentUser = this.userService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/signup']);
      return;
    }

    this.user = currentUser;
    this.editedUser = {
  ...currentUser
};

    this.calculateStatistics();

  }
  showPopupMessage(
    message: string,
    type: string = 'success'
) {

    this.popupMessage = message;

    this.popupType = type;

    this.showPopup = true;

    clearTimeout(this.popupTimer);

    this.popupTimer = setTimeout(() => {

        this.showPopup = false;

    }, 1500);

}

  calculateStatistics() {

    const history = this.user.purchaseHistory || [];

    this.totalOrders = history.length;

    this.totalSpent = history.reduce(
      (sum: number, order: any) => sum + order.total,
      0
    );

    this.totalItems = history.reduce(
      (sum: number, order: any) =>
        sum +
        order.items.reduce(
          (count: number, item: any) => count + item.quantity,
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

  this.editedUser = {
    ...this.user
  };

  this.isEditing = false;

}

saveProfile() {

  this.user.fullName = this.editedUser.fullName;
  this.user.email = this.editedUser.email;
  this.user.phone = this.editedUser.phone;
  this.user.address = this.editedUser.address;

  localStorage.setItem(
    'shopease_current_user',
    JSON.stringify(this.user)
  );

  const users = JSON.parse(
    localStorage.getItem('shopease_users') || '[]'
  );

  const index = users.findIndex(
    (u: any) =>
      u.username === this.user.username
  );

  if(index !== -1){

    users[index] = this.user;

    localStorage.setItem(
      'shopease_users',
      JSON.stringify(users)
    );

  }

  this.isEditing = false;
this.showPopupMessage(
    'Profile Updated Successfully'
);
}

  logout() {

    this.userService.logout();

    this.cartService.cartItems = [];

    this.cartService.lastOrder = [];

    this.cartService.lastTotal = 0;

    this.router.navigate(['/signup']);

  }

}