import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { CartService } from '../../services/cart';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);

  readonly username = inject(UserService).username;

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
