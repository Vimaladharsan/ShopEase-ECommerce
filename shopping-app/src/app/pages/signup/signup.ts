import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../services/user';
import { Popup } from '../../extras/popup/popup';

@Component({
  selector:'app-signup',
  standalone:true,
  imports:[
    FormsModule,
    Popup
  ],
  templateUrl:'./signup.html',
  styleUrl:'./signup.css'
})
export class Signup {
  username='';
  password='';
  uscheck='';
  pscheck='';
  showPopup=false;
  popupMessage='';
  constructor(
    private router:Router,
    private userService:UserService
  ){
    this.uscheck=this.userService.username;
    this.pscheck=this.userService.password;
  }
  showPopupMessage(message:string){
    this.popupMessage=message;
    this.showPopup=true;
    setTimeout(()=>{
      this.showPopup=false;
    },1000);
  }
  signup(form:NgForm){
    if(form.valid){
      if(
        this.username==this.uscheck &&
        this.password==this.pscheck
      ){
        this.showPopupMessage(
          'Login Successful'
        );
        setTimeout(()=>{
          this.router.navigate(['/home']);
        },1000);
      }
    }
  }
}