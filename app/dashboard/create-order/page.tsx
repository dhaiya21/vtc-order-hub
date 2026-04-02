"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useData, OrderItem } from "@/lib/data"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, ShoppingCart, IndianRupee, CheckCircle2 } from "lucide-react"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
}

interface OrderItemEntry {
  productId: string
  quantity: number
}

export default function CreateOrderPage() {
  const router = useRouter()
  const { customers, products, addOrder } = useData()
  const [customerId, setCustomerId] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItemEntry[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [success, setSuccess] = useState(false)

  const selectedCustomer = customers.find((c) => c.id === customerId)

  const addItem = () => {
    if (!selectedProductId || !quantity || parseInt(quantity) <= 0) return

    const existingIndex = orderItems.findIndex((item) => item.productId === selectedProductId)
    if (existingIndex >= 0) {
      const updated = [...orderItems]
      updated[existingIndex].quantity += parseInt(quantity)
      setOrderItems(updated)
    } else {
      setOrderItems([...orderItems, { productId: selectedProductId, quantity: parseInt(quantity) }])
    }

    setSelectedProductId("")
    setQuantity("")
  }

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId))
  }

  const getItemDetails = (productId: string) => {
    return products.find((p) => p.id === productId)
  }

  const calculateItemTotal = (productId: string, qty: number) => {
    const product = getItemDetails(productId)
    return product ? product.price * qty : 0
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + calculateItemTotal(item.productId, item.quantity), 0)
  }

  const handleSubmit = () => {
    if (!customerId || orderItems.length === 0) return

    const items: OrderItem[] = orderItems.map((item) => {
      const product = getItemDetails(item.productId)!
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      }
    })

    addOrder({
      customerId,
      customerName: selectedCustomer!.name,
      customerCompany: selectedCustomer!.companyName,
      items,
      totalAmount: calculateTotal(),
      status: "pending",
    })

    setSuccess(true)
    setTimeout(() => {
      router.push("/dashboard/orders")
    }, 1500)
  }

  const availableProducts = products.filter(
    (p) => p.stockQuantity > 0 && !orderItems.find((item) => item.productId === p.id)
  )

  return (
    <>
      <DashboardHeader
        title="Create Order"
        description="Create a new order for a customer"
      />

      {success && (
        <div className="p-6 pt-0">
          <Alert className="border-success bg-success/10">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">
              Order created successfully! Redirecting to orders...
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="p-6 pt-0 grid gap-6 lg:grid-cols-3">
        {/* Order Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>Select a customer for this order</CardDescription>
            </CardHeader>
            <CardContent>
              <Field>
                <FieldLabel>Select Customer</FieldLabel>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex flex-col">
                          <span>{customer.name}</span>
                          <span className="text-xs text-muted-foreground">{customer.companyName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {selectedCustomer && (
                <div className="mt-4 p-4 rounded-lg bg-muted">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedCustomer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company:</span>
                      <span className="font-medium">{selectedCustomer.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{selectedCustomer.phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Products */}
          <Card>
            <CardHeader>
              <CardTitle>Add Products</CardTitle>
              <CardDescription>Select products to add to the order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{product.name} ({product.capacity})</span>
                            <span className="text-muted-foreground">{formatCurrency(product.price)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <Button onClick={addItem} disabled={!selectedProductId || !quantity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          {orderItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>{orderItems.length} product(s) in order</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => {
                      const product = getItemDetails(item.productId)
                      if (!product) return null
                      return (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.capacity}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell>{item.quantity.toLocaleString()}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(calculateItemTotal(item.productId, item.quantity))}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No items added yet
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {orderItems.map((item) => {
                      const product = getItemDetails(item.productId)
                      if (!product) return null
                      return (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {product.name} x {item.quantity}
                          </span>
                          <span>{formatCurrency(calculateItemTotal(item.productId, item.quantity))}</span>
                        </div>
                      )
                    })}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-xl font-bold flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {calculateTotal().toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                disabled={!customerId || orderItems.length === 0 || success}
                onClick={handleSubmit}
              >
                Create Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}
