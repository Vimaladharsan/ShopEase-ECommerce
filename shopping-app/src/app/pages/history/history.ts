import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Header } from '../../extras/header/header';
import { CartService } from '../../services/cart';

@Component({
  selector:'app-history',
  standalone:true,
  imports:[
    CommonModule,
    RouterModule,
    Header
  ],
  templateUrl:'./history.html',
  styleUrl:'./history.css'
})
export class History {

  purchaseHistory:any[]=[];

  constructor(
    private cartService:CartService
  ){

    this.purchaseHistory=
    this.cartService.purchaseHistory;

  }

}