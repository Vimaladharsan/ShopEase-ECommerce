import { Injectable } from '@angular/core';
import { UserService } from './user';

@Injectable({
  providedIn:'root'
})
export class CartService {

  selectedCategory:any;

  lastOrder:any[]=[];

  lastTotal=0;

  private _purchaseHistory:any[]=[];

  private _cartItems:any[]=[];

  private lastUser = '';

  constructor(private userService: UserService) {
    this.checkUserSync();
  }

  private checkUserSync() {
    const currentUser = this.userService.username || 'guest';
    if (currentUser !== this.lastUser) {
      this.lastUser = currentUser;
      this.loadCartFromStorage();
      this.loadHistoryFromStorage();
    }
  }

  get cartItems(): any[] {
    this.checkUserSync();
    return new Proxy(this._cartItems, {
      set: (target, property, value, receiver) => {
        const success = Reflect.set(target, property, value, receiver);
        if (success) {
          this.saveCart();
        }
        return success;
      },
      deleteProperty: (target, property) => {
        const success = Reflect.deleteProperty(target, property);
        if (success) {
          this.saveCart();
        }
        return success;
      }
    });
  }

  set cartItems(val: any[]) {
    this.checkUserSync();
    this._cartItems = val;
    this.saveCart();
  }

  get purchaseHistory(): any[] {
    this.checkUserSync();
    return new Proxy(this._purchaseHistory, {
      set: (target, property, value, receiver) => {
        const success = Reflect.set(target, property, value, receiver);
        if (success) {
          this.saveHistory();
        }
        return success;
      },
      deleteProperty: (target, property) => {
        const success = Reflect.deleteProperty(target, property);
        if (success) {
          this.saveHistory();
        }
        return success;
      }
    });
  }

  set purchaseHistory(val: any[]) {
    this.checkUserSync();
    this._purchaseHistory = val;
    this.saveHistory();
  }

  private loadCartFromStorage() {
    const key = `shopease_cart_${this.lastUser}`;
    const data = localStorage.getItem(key);
    this._cartItems = data ? JSON.parse(data) : [];
  }

  private saveCart() {
    const key = `shopease_cart_${this.lastUser}`;
    localStorage.setItem(key, JSON.stringify(this._cartItems));
  }

  private loadHistoryFromStorage() {
    const key = `shopease_history_${this.lastUser}`;
    const data = localStorage.getItem(key);
    this._purchaseHistory = data ? JSON.parse(data) : [];
  }

  private saveHistory() {
    const key = `shopease_history_${this.lastUser}`;
    localStorage.setItem(key, JSON.stringify(this._purchaseHistory));
  }

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