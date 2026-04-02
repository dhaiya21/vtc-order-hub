"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, ShoppingCart, IndianRupee, AlertTriangle, TrendingUp, Package } from "lucide-react"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { customers, orders, products, getLowStockProducts, getTotalRevenue } = useData()

  // Redirect staff to customers page
  useEffect(() => {
    if (user?.role === "staff") {
      router.push("/dashboard/customers")
    }
  }, [user, router])

  if (user?.role === "staff") {
    return null
  }

  const lowStockProducts = getLowStockProducts()
  const totalRevenue = getTotalRevenue()
  const pendingOrders = orders.filter((o) => o.status === "pending").length

  const stats = [
    {
      title: "Total Customers",
      value: customers.length,
      icon: Users,
      description: "Registered customers",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      description: `${pendingOrders} pending`,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: IndianRupee,
      description: "From delivered orders",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Low Stock Alert",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      description: "Products below 200 units",
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
    },
  ]

  const recentOrders = orders.slice(-5).reverse()

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description={`Welcome back, ${user?.name}`}
      />
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Recent Orders</CardTitle>
              </div>
              <CardDescription>Latest orders from customers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "delivered"
                              ? "default"
                              : order.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Low Stock Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Low Stock Products</CardTitle>
              </div>
              <CardDescription>Products that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>All products are well stocked</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.capacity}</TableCell>
                        <TableCell>{product.stockQuantity}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">Low Stock</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
