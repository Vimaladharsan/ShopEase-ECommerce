import { Injectable, signal } from '@angular/core';
import { API_URL } from '../api';
import { Category } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // Seeded with fallback data so the UI has content before the fetch resolves.
  readonly categories = signal<Category[]>(this.getFallbackCategories());

  private isLoaded = false;

  constructor() {
    this.loadProducts();
  }

  async loadProducts(): Promise<Category[]> {
    if (this.isLoaded) {
      return this.categories();
    }
    return this.refresh();
  }

  // Re-fetch the catalog from the server (e.g. after an order changes stock)
  async refresh(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          this.categories.set(data);
        }
      }
    } catch (e) {
      console.error('Failed to load products from the server, using fallback data', e);
    }

    this.isLoaded = true;
    return this.categories();
  }

  private getFallbackCategories(): Category[] {
    return [
      {
        id: 1,
        name: 'Electronics',
        products: [
          { id: 101, name: 'Laptop', price: 100000, stock: 20 },
          { id: 102, name: 'Phone', price: 30000, stock: 20 },
          { id: 103, name: 'HeadPhones', price: 5000, stock: 20 },
          { id: 104, name: 'TV', price: 80000, stock: 20 }
        ]
      },
      {
        id: 2,
        name: 'Food',
        products: [
          { id: 201, name: 'Pizza', price: 500, stock: 20 },
          { id: 202, name: 'Burger', price: 200, stock: 20 },
          { id: 203, name: 'Sandwich', price: 100, stock: 20 },
          { id: 204, name: 'Juice', price: 100, stock: 20 }
        ]
      },
      {
        id: 3,
        name: 'Games',
        products: [
          { id: 301, name: 'Grand Theft Auto V', price: 3000, stock: 20 },
          { id: 302, name: 'God of War', price: 5000, stock: 20 },
          { id: 303, name: 'Red Dead Redemption 2', price: 5000, stock: 20 },
          { id: 304, name: 'Sekiro', price: 4000, stock: 20 }
        ]
      },
      {
        id: 4,
        name: 'Clothes',
        products: [
          { id: 401, name: 'Shirt', price: 1500, stock: 20 },
          { id: 402, name: 'Pant', price: 2000, stock: 20 },
          { id: 403, name: 'T-Shirt', price: 1000, stock: 20 },
          { id: 404, name: 'Trousers', price: 800, stock: 20 }
        ]
      }
    ];
  }
}
