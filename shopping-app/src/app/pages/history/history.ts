import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { Header } from '../../extras/header/header';
import { UserService } from '../../services/user';

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
    private userService:UserService,
    private router:Router
  ){
    if(!this.userService.username){
      this.router.navigate(['/signup']);
      return;
    }

    this.purchaseHistory=
    this.userService.getPurchaseHistory();

  }

}