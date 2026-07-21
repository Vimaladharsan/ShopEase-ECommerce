import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { UserService } from '../../services/user';
import { Popup } from '../../extras/popup/popup';
import { User } from '../../models';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Popup
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  isLoginMode = true;

  username = '';
  password = '';
  fullName = '';
  email = '';
  confirmPassword = '';

  readonly showPopup = signal(false);
  readonly submitting = signal(false);
  popupMessage = '';
  popupType = 'success';

  showPopupMessage(message: string, type: string = 'success') {
    this.popupMessage = message;
    this.popupType = type;
    this.showPopup.set(true);
    setTimeout(() => {
      this.showPopup.set(false);
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
    if (form.invalid || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    try {
      await this.handleSubmit();
    } finally {
      this.submitting.set(false);
    }
  }

  private async handleSubmit() {
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

      const newUser: User = {
        username: this.username,
        password: this.password,
        fullName: this.fullName,
        email: this.email,
        memberSince: new Date().toISOString(),
        phone: '',
        address: '',
        purchaseHistory: []
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
