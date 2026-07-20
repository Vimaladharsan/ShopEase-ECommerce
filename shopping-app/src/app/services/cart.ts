import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { UserService } from './user';
import { CartItem, Category, Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly userService = inject(UserService);

  readonly selectedCategory = signal<Category | null>(null);
  readonly selectedProduct = signal<Product | null>(null);

  readonly lastOrder = signal<CartItem[]>([]);
  readonly lastTotal = signal(0);
  readonly lastOrderId = signal('');

  private readonly items = signal<CartItem[]>([]);

  readonly cartItems = this.items.asReadonly();
  readonly totalAmount = computed(() =>
    this.items().reduce((total, item) => total + item.price * item.quantity, 0)
  );
  readonly cartCount = computed(() =>
    this.items().reduce((count, item) => count + item.quantity, 0)
  );

  constructor() {
    // Reload the cart from storage whenever the logged-in user changes.
    effect(() => {
      const key = this.storageKey(this.userService.username());
      untracked(() => this.items.set(this.loadCart(key)));
    });
  }

  private storageKey(username: string): string {
    return `shopease_cart_${username || 'guest'}`;
  }

  private loadCart(key: string): CartItem[] {
    const data = localStorage.getItem(key);
    if (!data) {
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private persist() {
    const key = this.storageKey(this.userService.username());
    localStorage.setItem(key, JSON.stringify(this.items()));
  }

  addToCart(product: Product, quantity: number) {
    this.items.update(items => {
      const existingItem = items.find(item => item.id === product.id);
      if (existingItem) {
        return items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity, stock: product.stock }
            : item
        );
      }
      return [
        ...items,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          quantity: quantity
        }
      ];
    });
    this.persist();
  }

  removeFromCart(productId: number) {
    this.items.update(items => items.filter(item => item.id !== productId));
    this.persist();
  }

  increaseQuantity(productId: number): boolean {
    const item = this.items().find(i => i.id === productId);
    if (!item || item.stock <= 0) {
      return false;
    }
    this.items.update(items =>
      items.map(i =>
        i.id === productId
          ? { ...i, quantity: i.quantity + 1, stock: i.stock - 1 }
          : i
      )
    );
    this.persist();
    return true;
  }

  decreaseQuantity(productId: number) {
    this.items.update(items =>
      items.map(i =>
        i.id === productId && i.quantity > 1
          ? { ...i, quantity: i.quantity - 1, stock: i.stock + 1 }
          : i
      )
    );
    this.persist();
  }

  clearCart() {
    this.items.set([]);
    this.persist();
  }
}
