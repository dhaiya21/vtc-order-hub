# VTC Order Hub – Smart Retail Order Management Platform

**VTC Order Hub** is a web-based Smart Retail Order Management Platform developed for a PET bottle manufacturing and wholesale business.
This system helps manage customers, products, orders, invoices, and reports in a digital and organized way.

The main objective of this project is to replace manual order registers and billing with a digital system that improves order tracking, reporting, and inventory management.

---

# Features

### 1. Authentication

* Role-based login system (Admin / Staff)
* Session stored in browser
* Admin and Staff have different access permissions

### 2. Customer Management

* Add new customers
* Edit customer details
* Search and filter customers
* Upload customers using CSV/Excel file

### 3. Product Management

* Add products
* Edit products
* Delete products
* Manage product price and stock

### 4. Order Management

* Create new order
* Select customer and products
* Automatic total calculation
* Automatic stock deduction
* View all orders

### 5. Order Status Management

Order status flow:

```
Pending → Confirmed → Shipped → Delivered → Cancelled
```

Users can update order status from the orders page.

### 6. Invoice Generation

* Invoice generated for each order
* Includes company details, customer details, products and total amount
* GST calculation included
* Printable invoice using browser print

### 7. Reports Dashboard (Admin Only)

* Revenue summary
* Order status distribution
* Top selling products
* Low stock alerts
* Charts and analytics

---

# Demo Credentials

| Role  | Email                                 | Password |
| ----- | ------------------------------------- | -------- |
| Admin | [admin@vtc.com](mailto:admin@vtc.com | admin123 |
| Staff | [staff@vtc.com](mailto:staff@vtc.com) | staff123 |

---

# Technologies Used

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Recharts (for charts)

### Backend / Data

* Next.js API / Local Storage (Demo)
* Data stored in browser localStorage for demo purposes

### Development Tools

* Node.js
* npm
* VS Code
* Vercel (Deployment)

---

# Project Structure

```
vtc-order-hub/
│
├── app/
│   ├── login/
│   ├── dashboard/
│   │   ├── customers/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── create-order/
│   │   ├── reports/
│
├── components/
├── lib/
├── public/
├── package.json
└── tsconfig.json
```

---

# How to Run Project Locally

### Requirements

* Node.js installed
* npm installed
* VS Code

### Steps

```
1. Download project ZIP
2. Extract the folder
3. Open folder in VS Code
4. Open terminal
5. Run: npm install
6. Run: npm run dev
7. Open browser: http://localhost:3000
```

---

# Data Storage

For demo purposes, all data is stored in **browser localStorage**:

* Customers
* Products
* Orders
* User session
* Theme settings

In real-world implementation, this system can be connected to:

* PostgreSQL
* MongoDB
* Firebase
* Supabase

---


