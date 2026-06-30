import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Header } from '../../extras/header/header';
import { CartService } from '../../services/cart';
import { UserService } from '../../services/user';
import { Popup } from '../../extras/popup/popup';

@Component({
  selector:'app-content',
  standalone:true,
  imports:[
    CommonModule,
    RouterModule,
    Header,
    Popup
  ],
  templateUrl:'./content.html',
  styleUrl:'./content.css'
})
export class Content {

  showPopup=false;

  popupMessage='';

  popupType='success';

  popupTimer:any;

  products:any[]=[];

  categoryName='';

  username='';

  quantities:any={};

  constructor(
    private router:Router,
    public cartService:CartService,
    private userService:UserService
  ){

    const selectedCategory=
    this.cartService.selectedCategory;

    if(selectedCategory){

      this.categoryName=
      selectedCategory.name;

      this.products=
      selectedCategory.products;

    }

    this.username=
    this.userService.username;

    for(let product of this.products){

      this.quantities[product.id]=1;

    }

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

  increaseQuantity(product:any){

    if(
      this.quantities[product.id] <
      product.stock
    ){

      this.quantities[product.id]++;

    }
    else{

      this.showPopupMessage(
        'Not Enough Stock',
        'error'
      );

    }

  }

  decreaseQuantity(product:any){

    if(this.quantities[product.id] > 1){

      this.quantities[product.id]--;

    }

  }

  addToCart(product:any){

    const quantity=
    this.quantities[product.id];

    if(product.stock < quantity){

      this.showPopupMessage(
        'Not Enough Stock',
        'error'
      );

      return;

    }

    product.stock -= quantity;

    const existingItem=
    this.cartService.cartItems.find(
      item => item.id === product.id
    );

    if(existingItem){

      existingItem.quantity += quantity;

      existingItem.stock =
      product.stock;

    }
    else{

      this.cartService.cartItems.push({

        id:product.id,

        name:product.name,

        price:product.price,

        stock:product.stock,

        quantity:quantity

      });

    }

    this.showPopupMessage(
      'Item Added To Cart',
      'success'
    );

    this.quantities[product.id]=1;

  }

  goToCheckout(){

    this.router.navigate(['/checkout']);

  }

}