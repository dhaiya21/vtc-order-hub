export interface User {
  id: number;
  email: string;
  role: string;
  name: string;
}

export interface Customer {
  id: number;
  customer_name: string;
  company_name: string;
  phone: string;
  email: string;
  address: string;
  gst_number: string;
  phone_verified: boolean;
  email_verified: boolean;
  created_at: string;
}

export interface Product {
  product_id: number;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  order_id: number;
  customer_id: number;
  customer_name: string;
  company_name: string;
  order_date: string;
  total_amount: number;
  status: string;
  items: OrderItem[];
}

export interface DashboardStats {
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  low_stock_products: number;
  recent_orders: Order[];
}
