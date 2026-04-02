"use client"

import { useState } from "react"
import { useData, Customer } from "@/lib/data"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Plus, Search, CheckCircle2, Phone, Building2, User } from "lucide-react"
import { Empty } from "@/components/ui/empty"

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", companyName: "" })
  const [pendingCustomer, setPendingCustomer] = useState<Omit<Customer, "id" | "createdAt"> | null>(null)
  const [otp, setOtp] = useState("")
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddCustomer = () => {
    // Generate a random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(newOtp)
    
    // Log OTP to console for demo purposes
    console.log("[v0] Generated OTP for verification:", newOtp)
    
    setPendingCustomer({
      name: newCustomer.name,
      phone: newCustomer.phone,
      companyName: newCustomer.companyName,
      verified: false,
    })
    
    setIsAddDialogOpen(false)
    setIsOtpDialogOpen(true)
  }

  const handleVerifyOtp = async () => {
    setIsVerifying(true)
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (otp === generatedOtp && pendingCustomer) {
      addCustomer({ ...pendingCustomer, verified: true })
      setIsOtpDialogOpen(false)
      setOtp("")
      setGeneratedOtp("")
      setPendingCustomer(null)
      setNewCustomer({ name: "", phone: "", companyName: "" })
    }
    
    setIsVerifying(false)
  }

  const handleSkipOtp = () => {
    if (pendingCustomer) {
      addCustomer({ ...pendingCustomer, verified: false })
    }
    setIsOtpDialogOpen(false)
    setOtp("")
    setGeneratedOtp("")
    setPendingCustomer(null)
    setNewCustomer({ name: "", phone: "", companyName: "" })
  }

  return (
    <>
      <DashboardHeader
        title="Customers"
        description="Manage your customer database"
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Enter the customer details. An OTP will be sent for verification.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Customer Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  id="phone"
                  placeholder="Enter 10-digit phone number"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="company">Company Name</FieldLabel>
                <Input
                  id="company"
                  placeholder="Enter company name"
                  value={newCustomer.companyName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddCustomer}
                disabled={!newCustomer.name || !newCustomer.phone || !newCustomer.companyName}
              >
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardHeader>

      {/* OTP Verification Dialog */}
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to {pendingCustomer?.phone}
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                (Check browser console for OTP - Demo mode)
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleSkipOtp}>
              Skip Verification
            </Button>
            <Button onClick={handleVerifyOtp} disabled={otp.length !== 6 || isVerifying}>
              {isVerifying ? (
                <>
                  <Spinner className="mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Customer List</CardTitle>
                <CardDescription>{customers.length} total customers</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <Empty
                icon={<User className="h-10 w-10" />}
                title="No customers found"
                description={searchTerm ? "Try a different search term" : "Add your first customer to get started"}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-mono text-sm">{customer.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {customer.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {customer.companyName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.verified ? (
                            <Badge className="bg-success text-success-foreground">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{customer.createdAt}</TableCell>
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
