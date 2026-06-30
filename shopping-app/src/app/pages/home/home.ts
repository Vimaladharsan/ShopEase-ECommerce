import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../../extras/header/header';
import { DataService } from '../../services/data';
import { UserService } from '../../services/user';
import { CartService } from '../../services/cart';

@Component({
  selector:'app-home',
  standalone:true,
  imports:[CommonModule,RouterModule,Header],
  templateUrl:'./home.html',
  styleUrl:'./home.css'
})
export class Home {
  categories:any[]=[];
  username='';
  constructor(
    private router:Router,
    private dataService:DataService,
    private userService:UserService,
    public cartService:CartService
  ){
    this.categories=this.dataService.categories;
    this.username=this.userService.username;
  }
  selectCategory(category:any){
    this.cartService.selectedCategory=category;
    this.router.navigate(['/content']);
  }
  goToCheckout(){
  this.router.navigate(['/checkout']);
}
}