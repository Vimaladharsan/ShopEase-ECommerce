import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { CartService } from '../../services/cart';
import { UserService } from '../../services/user';

@Component({
  selector:'app-bill',
  standalone:true,
  imports:[CommonModule,RouterModule],
  templateUrl:'./bill.html',
  styleUrl:'./bill.css'
})
export class Bill {
  orderedItems:any[]=[];
  totalAmount=0;
  username='';
  orderId='';
  currentDate=new Date();
  constructor(
    private cartService:CartService,
    private userService:UserService,
    private router:Router
  ){
    this.orderedItems =this.cartService.lastOrder;
    this.totalAmount =this.cartService.lastTotal;
    this.username =this.userService.username;
    this.orderId ='ORD' + Math.floor(Math.random()*1000000);
    if(this.orderedItems.length === 0){
      this.router.navigate(['/home']);
    }
  }
  backToHome(){
    this.router.navigate(['/home']);
  }
}