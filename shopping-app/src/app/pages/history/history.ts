import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Header } from '../../extras/header/header';
import { UserService } from '../../services/user';
import { Order } from '../../models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Header
  ],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History {
  readonly purchaseHistory: Order[] = inject(UserService).getPurchaseHistory();
}
