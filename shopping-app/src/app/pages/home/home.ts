import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../../extras/header/header';
import { DataService } from '../../services/data';
import { CartService } from '../../services/cart';
import { Category } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, Header],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);

  readonly categories = inject(DataService).categories;

  selectCategory(category: Category) {
    this.cartService.selectedCategory.set(category);
    this.router.navigate(['/content']);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
