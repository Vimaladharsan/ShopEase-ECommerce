import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  categories: any[] = [];
  private isLoaded = false;

  constructor() {
    // Synchronously seed fallback data to keep compatibility
    this.categories = this.getFallbackCategories();
    this.loadProducts();
  }

  async loadProducts(): Promise<any[]> {
    if (this.isLoaded) {
      return this.categories;
    }

    try {
      const response = await fetch('/data/products.json');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          this.categories = data;
        }
      }
    } catch (e) {
      console.error('Failed to load products.json, using fallback data', e);
    }

    // Apply any local stock changes from localStorage
    const localStockStr = localStorage.getItem('shopease_products_stock');
    if (localStockStr) {
      try {
        const stockMap = JSON.parse(localStockStr);
        for (let cat of this.categories) {
          for (let prod of cat.products) {
            if (stockMap[prod.id] !== undefined) {
              prod.stock = stockMap[prod.id];
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse local stock map', err);
      }
    }

    this.isLoaded = true;
    return this.categories;
  }

  updateProductStock(productId: number, newStock: number) {
    let found = false;
    for (let cat of this.categories) {
      for (let prod of cat.products) {
        if (prod.id === productId) {
          prod.stock = newStock;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    // Save stock changes to local storage
    const stockMap: { [key: number]: number } = {};
    for (let cat of this.categories) {
      for (let prod of cat.products) {
        stockMap[prod.id] = prod.stock;
      }
    }
    localStorage.setItem('shopease_products_stock', JSON.stringify(stockMap));
  }

  private getFallbackCategories() {
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

