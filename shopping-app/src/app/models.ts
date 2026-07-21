export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  brand?: string;
  rating?: number;
  reviews?: number;
  description?: string;
  warranty?: string;
  delivery?: string;
  image?: string;
}

export interface Category {
  id: number;
  name: string;
  products: Product[];
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  quantity: number;
}

export type OrderStatus = 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  date: string | Date;
  status: OrderStatus | string;
  paymentMethod: string;
  address: string;
}

export interface User {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  memberSince?: string;
  phone?: string;
  address?: string;
  purchaseHistory?: Order[];
}
