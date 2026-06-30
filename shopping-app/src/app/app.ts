import { Component, signal } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
} from '@angular/router';

import { Preloader } from './extras/preloader/preloader';
@Component({
  selector:'app-root',
  standalone:true,
  imports: [
    RouterOutlet,
    Preloader,
],
  templateUrl:'./app.html',
  styleUrl:'./app.css'
})
export class App {
  isLoading = signal(false);
  constructor(private router:Router){
    this.router.events.subscribe(event=>{
      if(event instanceof NavigationStart){
        this.isLoading.set(true);
      }
      if(
        event instanceof NavigationEnd
      ){
        setTimeout(()=>{
          this.isLoading.set(false);
        },2000);
      }
    });
  }
}