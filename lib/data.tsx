"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

export interface Customer {
  id: string
  name: string
  phone: string
  companyName: string
  verified: boolean
  createdAt: string
}

export interface Product {
  id: string
  name: string
  capacity: string
  material: string
  weight: string
  price: number
  stockQuantity: number
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerCompany: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  createdAt: string
}

// Initial demo data
const initialCustomers: Customer[] = [
  { id: "C001", name: "Rajesh Patel", phone: "9876543210", companyName: "Patel Beverages", verified: true, createdAt: "2026-01-15" },
  { id: "C002", name: "Priya Sharma", phone: "9123456789", companyName: "Fresh Drinks Ltd", verified: true, createdAt: "2026-01-20" },
  { id: "C003", name: "Amit Singh", phone: "9988776655", companyName: "Singh Water Co.", verified: false, createdAt: "2026-02-01" },
  { id: "C004", name: "Neha Gupta", phone: "9112233445", companyName: "Gupta Industries", verified: true, createdAt: "2026-02-10" },
  { id: "C005", name: "Vikram Reddy", phone: "9556677889", companyName: "Reddy Packagers", verified: true, createdAt: "2026-02-15" },
]

const initialProducts: Product[] = [
  { id: "P001", name: "Classic Water Bottle", capacity: "500ml", material: "PET", weight: "18g", price: 4.50, stockQuantity: 5000 },
  { id: "P002", name: "Premium Water Bottle", capacity: "1L", material: "PET", weight: "28g", price: 7.00, stockQuantity: 3500 },
  { id: "P003", name: "Economy Bottle", capacity: "250ml", material: "PET", weight: "12g", price: 3.00, stockQuantity: 8000 },
  { id: "P004", name: "Sports Cap Bottle", capacity: "750ml", material: "PET", weight: "24g", price: 8.50, stockQuantity: 2000 },
  { id: "P005", name: "Wide Mouth Jar", capacity: "2L", material: "PET", weight: "45g", price: 12.00, stockQuantity: 1500 },
  { id: "P006", name: "Flip Top Bottle", capacity: "500ml", material: "PET", weight: "20g", price: 5.50, stockQuantity: 150 },
  { id: "P007", name: "Square Bottle", capacity: "1L", material: "PET", weight: "30g", price: 8.00, stockQuantity: 80 },
]

const initialOrders: Order[] = [
  {
    id: "ORD001",
    customerId: "C001",
    customerName: "Rajesh Patel",
    customerCompany: "Patel Beverages",
    items: [
      { productId: "P001", productName: "Classic Water Bottle", quantity: 1000, price: 4.50 },
      { productId: "P002", productName: "Premium Water Bottle", quantity: 500, price: 7.00 },
    ],
    totalAmount: 8000,
    status: "delivered",
    createdAt: "2026-02-20",
  },
  {
    id: "ORD002",
    customerId: "C002",
    customerName: "Priya Sharma",
    customerCompany: "Fresh Drinks Ltd",
    items: [
      { productId: "P003", productName: "Economy Bottle", quantity: 2000, price: 3.00 },
    ],
    totalAmount: 6000,
    status: "shipped",
    createdAt: "2026-03-01",
  },
  {
    id: "ORD003",
    customerId: "C004",
    customerName: "Neha Gupta",
    customerCompany: "Gupta Industries",
    items: [
      { productId: "P004", productName: "Sports Cap Bottle", quantity: 500, price: 8.50 },
      { productId: "P005", productName: "Wide Mouth Jar", quantity: 300, price: 12.00 },
    ],
    totalAmount: 7850,
    status: "confirmed",
    createdAt: "2026-03-10",
  },
  {
    id: "ORD004",
    customerId: "C005",
    customerName: "Vikram Reddy",
    customerCompany: "Reddy Packagers",
    items: [
      { productId: "P001", productName: "Classic Water Bottle", quantity: 3000, price: 4.50 },
    ],
    totalAmount: 13500,
    status: "pending",
    createdAt: "2026-03-15",
  },
  {
    id: "ORD005",
    customerId: "C003",
    customerName: "Amit Singh",
    customerCompany: "Singh Water Co.",
    items: [
      { productId: "P002", productName: "Premium Water Bottle", quantity: 1000, price: 7.00 },
      { productId: "P006", productName: "Flip Top Bottle", quantity: 500, price: 5.50 },
    ],
    totalAmount: 9750,
    status: "cancelled",
    createdAt: "2026-03-18",
  },
]

interface DataContextType {
  customers: Customer[]
  products: Product[]
  orders: Order[]
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => void
  addCustomers: (customers: Omit<Customer, "id" | "createdAt">[]) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  getCustomerById: (id: string) => Customer | undefined
  getProductById: (id: string) => Product | undefined
  getLowStockProducts: () => Product[]
  getTotalRevenue: () => number
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const storedCustomers = localStorage.getItem("vtc_customers")
    const storedProducts = localStorage.getItem("vtc_products")
    const storedOrders = localStorage.getItem("vtc_orders")

    setCustomers(storedCustomers ? JSON.parse(storedCustomers) : initialCustomers)
    setProducts(storedProducts ? JSON.parse(storedProducts) : initialProducts)
    setOrders(storedOrders ? JSON.parse(storedOrders) : initialOrders)
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem("vtc_customers", JSON.stringify(customers))
    }
  }, [customers])

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem("vtc_products", JSON.stringify(products))
    }
  }, [products])

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("vtc_orders", JSON.stringify(orders))
    }
  }, [orders])

  const addCustomer = (customer: Omit<Customer, "id" | "createdAt">) => {
    const newCustomer: Customer = {
      ...customer,
      id: `C${String(customers.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setCustomers((prev) => [...prev, newCustomer])
  }

  const addCustomers = (newCustomers: Omit<Customer, "id" | "createdAt">[]) => {
    const customersWithIds = newCustomers.map((customer, index) => ({
      ...customer,
      id: `C${String(customers.length + index + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
    }))
    setCustomers((prev) => [...prev, ...customersWithIds])
  }

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((customer) => (customer.id === id ? { ...customer, ...data } : customer))
    )
  }

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: `P${String(products.length + 1).padStart(3, "0")}`,
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, ...data } : product))
    )
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
  }

  const addOrder = (order: Omit<Order, "id" | "createdAt">) => {
    const newOrder: Order = {
      ...order,
      id: `ORD${String(orders.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setOrders((prev) => [...prev, newOrder])
  }

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    )
  }

  const getCustomerById = (id: string) => customers.find((c) => c.id === id)
  const getProductById = (id: string) => products.find((p) => p.id === id)
  const getLowStockProducts = () => products.filter((p) => p.stockQuantity < 200)
  const getTotalRevenue = () =>
    orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, order) => sum + order.totalAmount, 0)

  return (
    <DataContext.Provider
      value={{
        customers,
        products,
        orders,
        addCustomer,
        addCustomers,
        updateCustomer,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        updateOrderStatus,
        getCustomerById,
        getProductById,
        getLowStockProducts,
        getTotalRevenue,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
