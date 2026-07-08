import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data';
import { Header } from '../../extras/header/header';
import { CartService } from '../../services/cart';
import { UserService } from '../../services/user';
import { Popup } from '../../extras/popup/popup';

@Component({
  selector:'app-checkout',
  standalone:true,
  imports:[
    CommonModule,
    RouterModule,
    Header,
    Popup
  ],
  templateUrl:'./checkout.html',
  styleUrl:'./checkout.css'
})
export class Checkout {

  cartItems:any[]=[];

  totalAmount=0;

  username='';

  showPopup=false;

  popupMessage='';

  popupType='success';

  popupTimer:any;

  constructor(
 private userService:UserService,
private dataService:DataService,
private router:Router
  ){
    if(!this.userService.username){
      this.router.navigate(['/signup']);
      return;
    }

    this.cartItems=
    this.cartService.cartItems;

    this.username=
    this.userService.username;

    this.calculateTotal();

  }

  showPopupMessage(
    message:string,
    type:string='success'
  ){

    this.popupType=type;

    this.popupMessage=message;

    this.showPopup=true;

    clearTimeout(this.popupTimer);

    this.popupTimer=setTimeout(()=>{

      this.showPopup=false;

    },1000);

  }

  calculateTotal(){

    this.totalAmount=
    this.cartService.getTotalAmount();

  }

  increaseQuantity(item:any){

    if(item.stock > 0){

      item.quantity++;

      item.stock--;

      this.calculateTotal();

    }
    else{

      this.showPopupMessage(
        'Not Enough Stock',
        'error'
      );

    }

  }

  decreaseQuantity(item:any){

    if(item.quantity > 1){

      item.quantity--;

      item.stock++;

      this.calculateTotal();

    }

  }

  removeItem(item:any){

    item.stock += item.quantity;

    this.cartService.removeFromCart(item);

    this.cartItems=
    this.cartService.cartItems;

    this.calculateTotal();

    this.showPopupMessage(
      'Item Removed',
      'success'
    );

  }

  placeOrder(){

    if(this.cartItems.length === 0){

      this.showPopupMessage(
        'Cart Is Empty',
        'error'
      );

      return;

    }

    this.cartService.lastOrder=[
      ...this.cartItems
    ];

    this.cartService.lastTotal=
    this.totalAmount;

   const order = {

  orderId:
  'ORD' +
  Math.floor(Math.random() * 1000000),

  items: [...this.cartItems],

  total: this.totalAmount,

  date: new Date(),

  status: 'Delivered'

};

this.userService.addPurchase(order);

    this.cartService.cartItems=[];

    this.showPopupMessage(
      'Order Placed Successfully',
      'success'
    );

    setTimeout(()=>{

      this.router.navigate(['/bill']);

    },1000);

  }

}