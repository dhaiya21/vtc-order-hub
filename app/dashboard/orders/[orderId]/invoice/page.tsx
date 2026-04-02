"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useData } from "@/lib/data"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Printer, Package, IndianRupee } from "lucide-react"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
}

export default function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = use(params)
  const router = useRouter()
  const { orders } = useData()

  const order = orders.find((o) => o.id === orderId)

  const handlePrint = () => {
    window.print()
  }

  if (!order) {
    return (
      <>
        <DashboardHeader title="Invoice Not Found" />
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Order not found</p>
              <Button className="mt-4" onClick={() => router.push("/dashboard/orders")}>
                Back to Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const getStatusColor = () => {
    switch (order.status) {
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

  return (
    <>
      <DashboardHeader title={`Invoice - ${order.id}`}>
        <Button variant="outline" onClick={() => router.push("/dashboard/orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handlePrint} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" />
          Print Invoice
        </Button>
      </DashboardHeader>

      <div className="p-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary">
                  <Package className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Vikas Trading Co.</h1>
                  <p className="text-sm text-muted-foreground">PET Bottle Manufacturers</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-foreground mb-1">INVOICE</h2>
                <p className="text-lg font-mono text-muted-foreground">{order.id}</p>
                <Badge variant={getStatusColor()} className="mt-2 capitalize">
                  {order.status}
                </Badge>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Customer & Order Details */}
            <div className="grid sm:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Bill To:</h3>
                <p className="font-semibold text-lg">{order.customerName}</p>
                <p className="text-muted-foreground">{order.customerCompany}</p>
              </div>
              <div className="sm:text-right">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Invoice Details:</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Date: </span>
                    <span className="font-medium">{order.createdAt}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Order ID: </span>
                    <span className="font-medium font-mono">{order.id}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden mb-8">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="text-right font-semibold">Price</TableHead>
                    <TableHead className="text-right font-semibold">Quantity</TableHead>
                    <TableHead className="text-right font-semibold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-80 space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Tax (0%)</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-3">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-xl font-bold flex items-center">
                    <IndianRupee className="h-5 w-5" />
                    {order.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">Thank you for your business!</p>
              <p>&copy; 2026 Vikas Trading Co. All rights reserved.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          [class*="Card"] * {
            visibility: visible;
          }
          [class*="Card"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </>
  )
}
