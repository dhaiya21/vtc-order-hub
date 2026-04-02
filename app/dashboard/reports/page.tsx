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
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { TrendingUp, Package, AlertTriangle, ShoppingCart, IndianRupee, Users } from "lucide-react"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

export default function ReportsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { customers, products, orders, getLowStockProducts, getTotalRevenue } = useData()

  // Redirect staff users
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

  // Order status distribution
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const orderStatusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }))

  // Revenue by status
  const revenueByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + order.totalAmount
    return acc
  }, {} as Record<string, number>)

  const revenueData = [
    { name: "Delivered", revenue: revenueByStatus["delivered"] || 0 },
    { name: "Shipped", revenue: revenueByStatus["shipped"] || 0 },
    { name: "Confirmed", revenue: revenueByStatus["confirmed"] || 0 },
    { name: "Pending", revenue: revenueByStatus["pending"] || 0 },
    { name: "Cancelled", revenue: revenueByStatus["cancelled"] || 0 },
  ]

  // Top products by order count
  const productOrderCounts = orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      acc[item.productName] = (acc[item.productName] || 0) + item.quantity
    })
    return acc
  }, {} as Record<string, number>)

  const topProducts = Object.entries(productOrderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }))

  // Summary stats
  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: IndianRupee,
      description: "From delivered orders",
    },
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      description: `${statusCounts["pending"] || 0} pending`,
    },
    {
      title: "Total Customers",
      value: customers.length,
      icon: Users,
      description: `${customers.filter((c) => c.verified).length} verified`,
    },
    {
      title: "Low Stock Items",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      description: "Need restocking",
    },
  ]

  return (
    <>
      <DashboardHeader
        title="Reports"
        description="Sales summary and inventory insights"
      />

      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
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

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue by Order Status
              </CardTitle>
              <CardDescription>Order value distribution across statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Status Distribution
              </CardTitle>
              <CardDescription>Breakdown of orders by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {orderStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Top Selling Products
              </CardTitle>
              <CardDescription>Products with highest order quantities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No sales data available</p>
                ) : (
                  topProducts.map((product, index) => {
                    const maxQuantity = topProducts[0].quantity
                    const percentage = (product.quantity / maxQuantity) * 100
                    return (
                      <div key={product.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-muted-foreground w-5">{index + 1}.</span>
                            <span className="font-medium">{product.name}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {product.quantity.toLocaleString()} units
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>Products requiring immediate restocking</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>All products are well stocked!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.capacity}</TableCell>
                        <TableCell className="text-right">{product.stockQuantity}</TableCell>
                        <TableCell>
                          <Badge variant={product.stockQuantity < 100 ? "destructive" : "secondary"}>
                            {product.stockQuantity < 100 ? "Critical" : "Low"}
                          </Badge>
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
