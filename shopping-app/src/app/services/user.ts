import { Injectable, computed, signal } from '@angular/core';
import { API_URL } from '../api';
import { CartItem, Order, User } from '../models';

const SESSION_KEY = 'shopease_current_user';

export interface PlaceOrderResult {
  success: boolean;
  message: string;
  order?: Order;
}

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

  async placeOrder(
    items: CartItem[],
    paymentMethod: string,
    address: string
  ): Promise<PlaceOrderResult> {
    const currentUser = this.currentUser();
    if (!currentUser) {
      return { success: false, message: 'Not logged in' };
    }

    try {
      const res = await fetch(`${API_URL}/users/${encodeURIComponent(currentUser.username)}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, quantity: i.quantity })),
          paymentMethod,
          address
        })
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        return { success: false, message: body?.message ?? 'Could not place order' };
      }

      this.setCurrentUser(body.user);
      return { success: true, message: 'Order placed', order: body.order };
    } catch (err) {
      console.error('Order request failed', err);
      return { success: false, message: 'Cannot reach the server' };
    }
  }

  // Fetch live order history (statuses progress over time on the server)
  async fetchOrders(): Promise<Order[]> {
    const currentUser = this.currentUser();
    if (!currentUser) return [];

    try {
      const res = await fetch(`${API_URL}/users/${encodeURIComponent(currentUser.username)}/orders`);
      if (!res.ok) {
        return currentUser.purchaseHistory ?? [];
      }
      const orders: Order[] = await res.json();
      this.setCurrentUser({ ...currentUser, purchaseHistory: orders });
      return orders;
    } catch (err) {
      console.error('Orders request failed', err);
      return currentUser.purchaseHistory ?? [];
    }
  }

  async cancelOrder(orderId: string): Promise<{ success: boolean; message: string }> {
    const currentUser = this.currentUser();
    if (!currentUser) {
      return { success: false, message: 'Not logged in' };
    }

    try {
      const res = await fetch(
        `${API_URL}/users/${encodeURIComponent(currentUser.username)}/orders/${encodeURIComponent(orderId)}/cancel`,
        { method: 'POST' }
      );
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        return { success: false, message: body?.message ?? 'Could not cancel order' };
      }
      this.setCurrentUser(body.user);
      return { success: true, message: 'Order cancelled' };
    } catch (err) {
      console.error('Cancel request failed', err);
      return { success: false, message: 'Cannot reach the server' };
    }
  }

  getPurchaseHistory(): Order[] {
    return this.currentUser()?.purchaseHistory ?? [];
  }

  logout() {
    this.setCurrentUser(null);
  }
}
