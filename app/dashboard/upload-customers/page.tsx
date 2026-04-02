"use client"

import { useState, useCallback } from "react"
import { useData } from "@/lib/data"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X } from "lucide-react"

interface ParsedCustomer {
  name: string
  phone: string
  companyName: string
}

export default function UploadCustomersPage() {
  const { addCustomers } = useData()
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedCustomer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const parseCSV = (content: string): ParsedCustomer[] => {
    const lines = content.trim().split("\n")
    if (lines.length < 2) {
      throw new Error("File must contain a header row and at least one data row")
    }

    const header = lines[0].toLowerCase()
    if (!header.includes("name") || !header.includes("phone") || !header.includes("company")) {
      throw new Error("CSV must have columns: Name, Phone, Company Name")
    }

    const customers: ParsedCustomer[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""))
      if (values.length >= 3 && values[0] && values[1] && values[2]) {
        customers.push({
          name: values[0],
          phone: values[1],
          companyName: values[2],
        })
      }
    }

    return customers
  }

  const handleFile = useCallback((selectedFile: File) => {
    setError(null)
    setSuccess(false)
    setParsedData([])

    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    const extension = selectedFile.name.split(".").pop()?.toLowerCase()
    const isValidType = validTypes.includes(selectedFile.type) || extension === "csv" || extension === "xlsx" || extension === "xls"

    if (!isValidType) {
      setError("Please upload a CSV or Excel file (.csv, .xlsx, .xls)")
      return
    }

    setFile(selectedFile)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const customers = parseCSV(content)
        if (customers.length === 0) {
          throw new Error("No valid customer data found in the file")
        }
        setParsedData(customers)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse file")
      }
    }
    reader.onerror = () => {
      setError("Failed to read file")
    }
    reader.readAsText(selectedFile)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFile(droppedFile)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleUpload = () => {
    if (parsedData.length > 0) {
      addCustomers(parsedData.map((c) => ({ ...c, verified: false })))
      setSuccess(true)
      setParsedData([])
      setFile(null)
    }
  }

  const handleClear = () => {
    setFile(null)
    setParsedData([])
    setError(null)
    setSuccess(false)
  }

  return (
    <>
      <DashboardHeader
        title="Upload Customers"
        description="Bulk import customers from CSV or Excel files"
      />
      <div className="p-6 space-y-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Upload a CSV or Excel file with columns: Name, Phone, Company Name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragging ? "Drop file here" : "Drag and drop your file here"}
                  </p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <Button variant="outline" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Browse Files
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supported formats: CSV, XLSX, XLS
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-success bg-success/10">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertTitle className="text-success">Success</AlertTitle>
            <AlertDescription>Customers have been imported successfully!</AlertDescription>
          </Alert>
        )}

        {/* Preview Table */}
        {parsedData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preview Data</CardTitle>
                  <CardDescription>
                    {parsedData.length} customers ready to import from {file?.name}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleClear}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button size="sm" onClick={handleUpload}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import {parsedData.length} Customers
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 10).map((customer, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.companyName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parsedData.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    And {parsedData.length - 10} more customers...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sample Format */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Format</CardTitle>
            <CardDescription>Your CSV file should follow this format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`Name,Phone,Company Name
Rajesh Kumar,9876543210,Kumar Industries
Priya Sharma,9123456789,Sharma Beverages
Amit Patel,9988776655,Patel Packaging`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
