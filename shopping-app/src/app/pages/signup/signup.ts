import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { UserService } from '../../services/user';
import { Popup } from '../../extras/popup/popup';

@Component({
  selector:'app-signup',
  standalone:true,
  imports:[
    CommonModule,
    FormsModule,
    Popup
  ],
  templateUrl:'./signup.html',
  styleUrl:'./signup.css'
})
export class Signup {
  isLoginMode = true;

  username = '';
  password = '';
  fullName = '';
  email = '';
  confirmPassword = '';

  showPopup = false;
  popupMessage = '';
  popupType = 'success';

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  showPopupMessage(message: string, type: string = 'success') {
    this.popupMessage = message;
    this.popupType = type;
    this.showPopup = true;
    setTimeout(() => {
      this.showPopup = false;
    }, 1500);
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    // Reset form fields
    this.username = '';
    this.password = '';
    this.fullName = '';
    this.email = '';
    this.confirmPassword = '';
  }

  async onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    if (this.isLoginMode) {
      // Login flow
      const success = await this.userService.login(this.username, this.password);
      if (success) {
        this.showPopupMessage('Login Successful', 'success');
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1200);
      } else {
        this.showPopupMessage('Invalid Credentials!', 'error');
      }
    } else {
      // Registration flow
      if (this.password !== this.confirmPassword) {
        this.showPopupMessage('Passwords do not match!', 'error');
        return;
      }

      const newUser = {
        username: this.username,
        password: this.password,
        fullName: this.fullName,
        email: this.email
      };

      const result = await this.userService.register(newUser);
      if (result.success) {
        this.showPopupMessage('Registration Successful!', 'success');
        // Auto-login after registration
        await this.userService.login(this.username, this.password);
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1200);
      } else {
        this.showPopupMessage(result.message, 'error');
      }
    }
  }
}