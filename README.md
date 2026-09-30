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
