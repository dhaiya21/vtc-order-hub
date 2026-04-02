"use client"

import { useState } from "react"
import Link from "next/link"
import { useData, OrderStatus } from "@/lib/data"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Empty } from "@/components/ui/empty"
import { Search, ShoppingCart, FileText, Plus, IndianRupee } from "lucide-react"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case "delivered":
      return "default"
    case "shipped":
      return "secondary"
    case "confirmed":
      return "outline"
    case "cancelled":
      return "destructive"
    default:
      return "secondary"
  }
}

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerCompany.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus)
  }

  return (
    <>
      <DashboardHeader
        title="Orders"
        description="View and manage customer orders"
      >
        <Button asChild>
          <Link href="/dashboard/create-order">
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Link>
        </Button>
      </DashboardHeader>

      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Order List</CardTitle>
                <CardDescription>{orders.length} total orders</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <Empty
                icon={<ShoppingCart className="h-10 w-10" />}
                title="No orders found"
                description={searchTerm || statusFilter !== "all" ? "Try different filters" : "Create your first order to get started"}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-medium">{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell className="text-muted-foreground">{order.customerCompany}</TableCell>
                        <TableCell>{order.items.length} item(s)</TableCell>
                        <TableCell>
                          <div className="flex items-center font-medium">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            {order.totalAmount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{order.createdAt}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                                {order.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <span className="capitalize">{option.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/orders/${order.id}/invoice`}>
                                <FileText className="h-4 w-4 mr-2" />
                                Invoice
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
