# 🚀 Seval Drones - E-Commerce & UAV Powertrain Platform

A full-stack, enterprise-grade e-commerce platform engineered for high-performance brushless motors, ESC speed controllers, aerospace composite materials, and UAV accessories.

---

## 📋 Table of Contents

- [Features](#-features)
  - [Customer Storefront](#-customer-storefront)
  - [Admin Management Portal](#-admin-management-portal)
- [Tech Stack](#-tech-stack)
- [Architecture & Directory Structure](#-architecture--directory-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
  - [Backend (.env)](#backend-env)
  - [Frontend (.env)](#frontend-env)
- [Installation & Local Setup](#-installation--local-setup)
  - [1. Database Initialization & Seeding](#1-database-initialization--seeding)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Default Credentials & Promo Codes](#-default-credentials--promo-codes)
- [API Endpoints Reference](#-api-endpoints-reference)
- [License](#-license)

---

## ✨ Features

### 🛒 Customer Storefront
- **Dynamic Product Catalog**: Search, category filters, brand filters, and price ranges with instant debounce.
- **Detailed Product Showcase**: Technical specs, industrial application badges, stock counters, and related products.
- **Cart & Wishlist Management**: LocalStorage persistence, quantity controls, and cart drawer preview.
- **Discount Coupons & GST**: Dynamic calculations for 18% GST (taxable + GST breakdown) and coupons (`SEVAL10`, `FREESHIP`).
- **Razorpay Payment Gateway**: Seamless INR payment checkout with test/live gateway integration and automated signature verification.
- **Order Tracking**: Real-time multi-stage visual timeline tracking by order number (`#SD-XXXXXX`).
- **Responsive & Modern UI**: Built with Tailwind CSS, clean Inter typography, glassmorphic panels, and mobile drawer navigation.

### 🛡️ Admin Management Portal
- **Secure Authentication**: JWT session handling with bcrypt password hashing.
- **2-Step OTP Password Recovery**: Automated 6-digit verification code dispatch via Nodemailer SMTP.
- **Analytics Dashboard**: Real-time sales metrics, revenue calculations, total orders, and low-stock alerts.
- **Catalogue & Inventory Control**: Create, update, delete products, category assignments, and live stock adjustments.
- **Order Fulfillment**: Track customer orders, update delivery statuses (Pending, Confirmed, Shipped, Delivered), and inspect customer shipping details.
- **Store Configuration**: GST tax rate management, shipping rules, and contact configurations.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v3 + Custom Design System
- **Typography**: Google Fonts Inter
- **Icons**: Lucide React
- **HTTP Client**: Native Fetch API / Async Service Architecture

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL (`pg` connection pool)
- **Security**: Helmet, CORS, Express Rate Limit, Express Validator
- **Auth**: JWT (JSON Web Tokens) + Bcrypt
- **Payments**: Razorpay SDK
- **Mailing**: Nodemailer (SMTP 2FA OTPs)

---

## 📁 Architecture & Directory Structure

```text
motorx_web/
├── backend/
│   ├── src/
│   │   ├── config/             # Database pool & Razorpay configuration
│   │   ├── controllers/        # Product, Order, Admin Auth & Analytics controllers
│   │   ├── middleware/         # Auth token verification & error handlers
│   │   ├── routes/             # Express API endpoints
│   │   ├── services/           # Email (2FA) & Payment verification services
│   │   └── server.js           # Server entry point
│   ├── scripts/                # Utility scripts (e.g., createAdmin.js)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── products/           # Categorized high-resolution product images
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ProductCard, CartDrawer, etc.
│   │   ├── context/            # Cart, Wishlist, Toast & AdminAuth React Contexts
│   │   ├── data/               # Local fallback data & category definitions
│   │   ├── pages/              # Home, Motors, ProductDetails, Cart, Checkout, etc.
│   │   │   └── admin/          # Admin Dashboard, Products, Orders, Inventory, Login
│   │   ├── services/           # Backend API integration clients (api.js, adminApi.js)
│   │   ├── utils/              # INR currency formatting, cart calculations, image helpers
│   │   ├── App.jsx             # Route definitions & layout wrappers
│   │   ├── index.css           # Global typography, animations & Tailwind directives
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── database/
    ├── init.js                 # Automated PostgreSQL table creation and seed script
    ├── schema.sql              # Database DDL schema (Tables, Relations, Enums)
    └── seed.sql                # 25 real composite products, categories, brands & admin
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **PostgreSQL**: `v14.x` or higher (running locally on port `5432`)

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:

```env
PORT=5000

# PostgreSQL Connection Details
PGHOST=localhost
PGPORT=5432
PGDATABASE=Motorx
PGUSER=postgres
PGPASSWORD=postgres

# Security & Auth
JWT_SECRET=seval_drones_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:5173

# Razorpay Test / Live Credentials
RAZORPAY_KEY_ID=rzp_test_motorx_demo
RAZORPAY_KEY_SECRET=motorx_razorpay_secret_demo
RAZORPAY_WEBHOOK_SECRET=motorx_webhook_secret_demo

# SMTP Email Configuration (Optional: for 2FA Password Reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM="Seval Drones Security <your-email@gmail.com>"
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Installation & Local Setup

### 1. Database Initialization & Seeding

1. Ensure PostgreSQL is running.
2. Create the database in PostgreSQL:
   ```sql
   CREATE DATABASE "Motorx";
   ```
3. Run the database initialization script from the `backend/` directory:
   ```bash
   cd backend
   npm install
   npm run db:init
   ```
   *This will execute `schema.sql` and seed 25 real composite products, categories, brands, and default admin accounts.*

---

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```
The backend server will start on: **`http://localhost:5000`**  
Health check endpoint: **`http://localhost:5000/api/health`**

---

### 3. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
The frontend will start on: **`http://localhost:5173`**

---

## 🔑 Default Credentials & Promo Codes

### Admin Portal Access
- **URL**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Admin Email**: `admin@sevaldrones.com` *(or `admin@motorx.com`)*
- **Admin Password**: `Admin@123`

### Checkout Promo Coupons
- `SEVAL10` / `MOTORX10` — 10% instant discount on total cart value
- `FREESHIP` — Free standard/express shipping
- `FIRST500` — ₹500 off on orders ₹2,000+

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Server & Database connectivity health check | Public |
| `GET` | `/api/products` | Paginated product list with search/category/brand filters | Public |
| `GET` | `/api/products/:slug` | Get single product specifications and related items | Public |
| `GET` | `/api/categories` | List active product categories | Public |
| `GET` | `/api/brands` | List active manufacturer brands | Public |
| `POST` | `/api/orders` | Create guest/customer order with GST breakdown | Public |
| `GET` | `/api/orders/:orderNumber` | Live order tracking status and fulfillment timeline | Public |
| `POST` | `/api/payments/create-order`| Initialize Razorpay payment session | Public |
| `POST` | `/api/payments/verify` | Verify Razorpay HMAC signature | Public |
| `POST` | `/api/admin/auth/login` | Admin login and JWT token issuance | Public |
| `POST` | `/api/admin/auth/request-otp`| Request 6-digit 2FA reset OTP | Public |
| `POST` | `/api/admin/auth/verify-otp` | Verify OTP and reset admin password | Public |
| `GET` | `/api/admin/analytics/summary`| Revenue, orders & inventory analytics metrics | Protected (Admin) |
| `POST` | `/api/admin/products` | Create a new catalog product | Protected (Admin) |
| `PUT` | `/api/admin/products/:id` | Update product details and inventory | Protected (Admin) |
| `DELETE`| `/api/admin/products/:id` | Delete product from catalog | Protected (Admin) |
| `PATCH`| `/api/admin/inventory/:id`| Adjust product stock quantity | Protected (Admin) |
| `GET` | `/api/admin/orders` | List customer orders with fulfillment status filter | Protected (Admin) |
| `PATCH`| `/api/admin/orders/:id/status`| Update order status (Pending/Confirmed/Shipped/Delivered) | Protected (Admin) |

---

## 📄 License

Copyright © 2026 **Seval Drones**. All Rights Reserved.