# 🛒 ShopEase — Full-Stack E-Commerce Application

ShopEase is a full-stack online shopping application built with an **Angular 21** frontend and an **Express** backend. It provides a complete, realistic shopping experience: user authentication, product browsing, a validated cart, a real checkout with delivery details and payment method, server-authoritative orders, and live order tracking.

---

## 🏗️ Architecture

```
ShopEase-ECommerce/
├── server/            # Express REST API (port 3000)
│   ├── server.js
│   ├── routes/
│   │   ├── users.js   # auth, profile, orders, cancellation
│   │   └── products.js
│   └── data/          # JSON data store (single source of truth)
│       ├── users.json
│       └── products.json
└── shopping-app/      # Angular 21 client (port 4200)
    └── src/app/
        ├── services/  # cart, data, user (signal-based)
        ├── pages/     # signup, home, content, product-details,
        │              # checkout, bill, history, profile
        └── extras/    # header, popup (toast), preloader
```

The **server is the authority** on prices, stock, order totals, delivery fees, and order status. The client never mutates catalog stock directly — it always reflects what the server confirms.

---

## 🚀 Running the app

You need **two terminals** — one for the API, one for the client.

### 1. Backend API

```bash
cd server
npm install
npm start          # → http://localhost:3000
```

### 2. Frontend

```bash
cd shopping-app
npm install
npm start          # → http://localhost:4200
```

Open **http://localhost:4200** in your browser.

### Demo login

| Username | Password |
|----------|----------|
| `Vimal`  | `12345`  |
| `DemoUser` | `password123` |

…or register a new account from the Sign Up screen.

---

## ✨ Features

**Shopping**
- Product catalog by category, with stock badges (low-stock and out-of-stock states)
- Product detail pages with ratings, specs, and description
- Cart with quantity controls that respect live stock limits

**Real checkout**
- Delivery address (prefilled from your profile) and payment method (Cash on Delivery / UPI)
- Server-computed subtotal, delivery fee (₹49, free over ₹1000), and total
- Stock is validated at order time — you can't order more than is available

**Orders**
- Server-generated order IDs
- Order status progresses over time: **Placed → Processing → Shipped → Delivered**
- **Order tracking** page with color-coded status chips
- **Cancel an order** before it ships — stock is automatically restored

**Accounts**
- Registration and login with **bcrypt-hashed passwords** (never sent to the client)
- Editable profile with order statistics

**Experience**
- Cohesive dark design system with gradients, glass surfaces, and motion
- Fully responsive (360px phones → desktop)
- Respects `prefers-reduced-motion`

---

## 🔌 API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users/register` | Create an account (hashes password) |
| `POST` | `/users/login` | Authenticate |
| `PUT`  | `/users/:username` | Update profile |
| `GET`  | `/users/:username/orders` | List orders (statuses progressed) |
| `POST` | `/users/:username/orders` | Place an order (validates stock) |
| `POST` | `/users/:username/orders/:orderId/cancel` | Cancel & restore stock |
| `GET`  | `/products` | Product catalog |

---

## 🛠️ Tech Stack

- **Frontend:** Angular 21 (standalone components, signals, lazy routes), TypeScript, Bootstrap, CSS
- **Backend:** Node.js, Express 5, bcryptjs
- **Storage:** JSON files (easily swappable for a database)

---

## 📌 Notes

- Data lives in `server/data/*.json`. To reset stock/orders for a fresh demo, restore those files.
- This is a learning/portfolio project — the JSON store and session handling are intentionally simple. Natural next steps: a real database and JWT/session tokens.
