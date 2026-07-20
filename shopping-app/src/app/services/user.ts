import { Injectable, computed, signal } from '@angular/core';
import { API_URL } from '../api';
import { Order, User } from '../models';

const SESSION_KEY = 'shopease_current_user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly currentUserSignal = signal<User | null>(this.readSession());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly username = computed(() => this.currentUser()?.username ?? '');

  private readSession(): User | null {
    const sessionUserStr = localStorage.getItem(SESSION_KEY);
    if (!sessionUserStr) {
      return null;
    }
    try {
      return JSON.parse(sessionUserStr);
    } catch {
      return null;
    }
  }

  private setCurrentUser(user: User | null) {
    this.currentUserSignal.set(user);
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        return false;
      }
      const user: User = await res.json();
      this.setCurrentUser(user);
      return true;
    } catch (err) {
      console.error('Login request failed — is the backend running?', err);
      return false;
    }
  }

  async register(newUser: User): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        return { success: true, message: 'Registration successful' };
      }
      const body = await res.json().catch(() => null);
      return { success: false, message: body?.message ?? 'Registration failed' };
    } catch (err) {
      console.error('Register request failed — is the backend running?', err);
      return { success: false, message: 'Cannot reach the server' };
    }
  }

  async updateProfile(changes: Pick<User, 'fullName' | 'email' | 'phone' | 'address'>): Promise<boolean> {
    const currentUser = this.currentUser();
    if (!currentUser) return false;

    try {
      const res = await fetch(`${API_URL}/users/${encodeURIComponent(currentUser.username)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes)
      });
      if (!res.ok) {
        return false;
      }
      const updatedUser: User = await res.json();
      this.setCurrentUser(updatedUser);
      return true;
    } catch (err) {
      console.error('Profile update request failed', err);
      return false;
    }
  }

  async addPurchase(order: Order): Promise<boolean> {
    const currentUser = this.currentUser();
    if (!currentUser) return false;

    try {
      const res = await fetch(`${API_URL}/users/${encodeURIComponent(currentUser.username)}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (!res.ok) {
        return false;
      }
      const updatedUser: User = await res.json();
      this.setCurrentUser(updatedUser);
      return true;
    } catch (err) {
      console.error('Order request failed', err);
      return false;
    }
  }

  getPurchaseHistory(): Order[] {
    return this.currentUser()?.purchaseHistory ?? [];
  }

  logout() {
    this.setCurrentUser(null);
  }
}
