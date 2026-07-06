import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { UserService } from '../../services/user';
import { CartService } from '../../services/cart';

@Component({
  selector:'app-profile',
  standalone:true,
  imports:[CommonModule,RouterModule],
  templateUrl:'./profile.html',
  styleUrl:'./profile.css'
})
export class Profile {

  username='';
  password='';

  constructor(
    private userService:UserService,
    private cartService:CartService,
    private router:Router
  ){
    if(!this.userService.username){
      this.router.navigate(['/signup']);
      return;
    }
    this.username=this.userService.username;
    this.password=this.userService.password;
  }

  logout(){
    this.userService.logout();
    this.cartService.cartItems=[];
    this.cartService.lastOrder=[];
    this.cartService.lastTotal=0;
    this.router.navigate(['/signup']);
  }

}