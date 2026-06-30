import { Injectable } from '@angular/core';

@Injectable({
  providedIn:'root'
})
export class CartService {

  selectedCategory:any;

  lastOrder:any[]=[];

  lastTotal=0;

  purchaseHistory:any[]=[];

  cartItems:any[]=[];

  addToCart(product:any,quantity:number){

    const existingItem=this.cartItems.find(
      item => item.id === product.id
    );

    if(existingItem){

      existingItem.quantity += quantity;

      existingItem.stock =
      product.stock;

    }
    else{

      this.cartItems.push({

        id:product.id,

        name:product.name,

        price:product.price,

        stock:product.stock,

        quantity:quantity

      });

    }

  }

  removeFromCart(product:any){

    this.cartItems=this.cartItems.filter(
      item => item.id !== product.id
    );

  }

  increaseQuantity(item:any){

    if(item.stock > 0){

      item.quantity++;

      item.stock--;

    }

  }

  decreaseQuantity(item:any){

    if(item.quantity > 1){

      item.quantity--;

      item.stock++;

    }

  }

  getTotalAmount(){

    let total=0;

    for(let item of this.cartItems){

      total += item.price * item.quantity;

    }

    return total;

  }

  getCartCount(){

    let count=0;

    for(let item of this.cartItems){

      count += item.quantity;

    }

    return count;

  }

}