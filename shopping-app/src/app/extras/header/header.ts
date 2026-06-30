import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { CartService } from '../../services/cart';
import { UserService } from '../../services/user';

@Component({
  selector:'app-header',
  standalone:true,
  imports:[CommonModule,RouterModule],
  templateUrl:'./header.html',
  styleUrl:'./header.css'
})
export class Header {

  username='';

  constructor(
    public cartService:CartService,
    private userService:UserService,
    private router:Router
  ){

    this.username=this.userService.username;

  }

  goToCheckout(){

    this.router.navigate(['/checkout']);

  }

}