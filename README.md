# VTC Order Hub – Smart Retail Order Management Platform

A lightweight ERP-style order management platform for a PET bottle manufacturing and wholesale business.

## Features

- **Authentication**: Role-based login (Admin / Staff) with session cookies
- **Customer Master**: Add/edit/delete customers with OTP phone verification (simulated)
- **Bulk Upload**: Import customers from Excel (.xlsx)
- **Product Inventory**: Manage products with categories and stock levels
- **Order Management**: Cart-based order creation with automatic stock deduction
- **Order Status**: Update status (Pending → Confirmed → Shipped → Delivered)
- **Invoice**: Printable invoice with 18% GST calculation
- **Reports**: Order status breakdown, revenue summary, top customers

## Demo Credentials

| Role  | Email           | Password  |
|-------|-----------------|-----------|
| Admin | admin@vtc.com   | admin123  |
| Staff | staff@vtc.com   | staff123  |

## Setup

### Backend (Python Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs on: http://localhost:5000

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

The frontend proxies all `/api/*` requests to the Flask backend on port 5000.

## Notes

- The SQLite database is created automatically at `backend/database/vtc_orders.db`
- Demo data (20 customers, 15 products, 5 orders) is seeded on first run
- OTP values are printed to the backend console (not sent via SMS)
- The vite proxy strips the `/api` prefix before forwarding to Flask
