import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DashboardStats {
    totalOrders: bigint;
    lowStockProducts: bigint;
    recentOrders: Array<Order>;
    totalRevenue: number;
    totalCustomers: bigint;
}
export interface Customer {
    id: bigint;
    customerName: string;
    gstNumber: string;
    createdAt: bigint;
    email: string;
    address: string;
    companyName: string;
    phone: string;
    phoneVerified: boolean;
}
export interface CreateOrderItem {
    productId: bigint;
    quantity: bigint;
}
export interface Order {
    customerName: string;
    status: string;
    orderDate: bigint;
    orderId: bigint;
    totalAmount: number;
    companyName: string;
    customerId: bigint;
    items: Array<OrderItem>;
}
export interface Product {
    stockQuantity: bigint;
    name: string;
    productId: bigint;
    category: string;
    price: number;
}
export interface OrderItem {
    id: bigint;
    productId: bigint;
    productName: string;
    orderId: bigint;
    quantity: bigint;
    price: number;
}
export interface backendInterface {
    addCustomer(customerName: string, companyName: string, phone: string, email: string, address: string, gstNumber: string): Promise<{
        ok: boolean;
        customer?: Customer;
        message: string;
    }>;
    addProduct(name: string, category: string, price: number, stockQuantity: bigint): Promise<{
        ok: boolean;
        message: string;
        product?: Product;
    }>;
    createOrder(customerId: bigint, items: Array<CreateOrderItem>): Promise<{
        ok: boolean;
        orderId?: bigint;
        message: string;
    }>;
    deleteCustomer(id: bigint): Promise<{
        ok: boolean;
        message: string;
    }>;
    deleteProduct(productId: bigint): Promise<{
        ok: boolean;
        message: string;
    }>;
    getCustomers(search: string): Promise<Array<Customer>>;
    getDashboardStats(): Promise<DashboardStats>;
    getInvoice(orderId: bigint): Promise<Order | null>;
    getOrders(): Promise<Array<Order>>;
    getProducts(): Promise<Array<Product>>;
    searchCustomers(query: string): Promise<Array<Customer>>;
    seedDemoData(): Promise<void>;
    updateCustomer(id: bigint, customerName: string, companyName: string, phone: string, email: string, address: string, gstNumber: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    updateOrderStatus(orderId: bigint, status: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    updateProduct(productId: bigint, name: string, category: string, price: number, stockQuantity: bigint): Promise<{
        ok: boolean;
        message: string;
    }>;
}
