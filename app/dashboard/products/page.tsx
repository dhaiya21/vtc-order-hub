"use client"

import { useState } from "react"
import { useData, Product } from "@/lib/data"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Empty } from "@/components/ui/empty"
import { Plus, Search, Pencil, Trash2, Box, IndianRupee } from "lucide-react"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
}

const initialFormState = {
  name: "",
  capacity: "",
  material: "PET",
  weight: "",
  price: "",
  stockQuantity: "",
}

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogProduct, setDeleteDialogProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState(initialFormState)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.capacity.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProduct = () => {
    addProduct({
      name: formData.name,
      capacity: formData.capacity,
      material: formData.material,
      weight: formData.weight,
      price: parseFloat(formData.price) || 0,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
    })
    setFormData(initialFormState)
    setIsAddDialogOpen(false)
  }

  const handleEditProduct = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        capacity: formData.capacity,
        material: formData.material,
        weight: formData.weight,
        price: parseFloat(formData.price) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
      })
      setFormData(initialFormState)
      setEditingProduct(null)
      setIsEditDialogOpen(false)
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      capacity: product.capacity,
      material: product.material,
      weight: product.weight,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = () => {
    if (deleteDialogProduct) {
      deleteProduct(deleteDialogProduct.id)
      setDeleteDialogProduct(null)
    }
  }

  const getStockBadge = (quantity: number) => {
    if (quantity < 100) {
      return <Badge variant="destructive">Critical</Badge>
    } else if (quantity < 200) {
      return <Badge className="bg-warning text-warning-foreground">Low</Badge>
    }
    return <Badge className="bg-success text-success-foreground">In Stock</Badge>
  }

  const ProductForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="name">Product Name</FieldLabel>
        <Input
          id="name"
          placeholder="e.g., Classic Water Bottle"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="capacity">Capacity</FieldLabel>
          <Input
            id="capacity"
            placeholder="e.g., 500ml"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="material">Material</FieldLabel>
          <Input
            id="material"
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="weight">Weight</FieldLabel>
          <Input
            id="weight"
            placeholder="e.g., 18g"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="price">Price (₹)</FieldLabel>
          <Input
            id="price"
            type="number"
            step="0.01"
            placeholder="e.g., 4.50"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="stock">Stock Quantity</FieldLabel>
        <Input
          id="stock"
          type="number"
          placeholder="e.g., 5000"
          value={formData.stockQuantity}
          onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
        />
      </Field>
    </FieldGroup>
  )

  return (
    <>
      <DashboardHeader
        title="Products"
        description="Manage your PET bottle product catalog"
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Enter the product details to add to your catalog.
              </DialogDescription>
            </DialogHeader>
            <ProductForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddProduct}
                disabled={!formData.name || !formData.capacity || !formData.price}
              >
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardHeader>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details.
            </DialogDescription>
          </DialogHeader>
          <ProductForm isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditProduct}
              disabled={!formData.name || !formData.capacity || !formData.price}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialogProduct} onOpenChange={() => setDeleteDialogProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteDialogProduct?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Product Catalog</CardTitle>
                <CardDescription>{products.length} products in inventory</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <Empty
                icon={<Box className="h-10 w-10" />}
                title="No products found"
                description={searchTerm ? "Try a different search term" : "Add your first product to get started"}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">{product.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Box className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{product.capacity}</TableCell>
                        <TableCell>{product.material}</TableCell>
                        <TableCell>{product.weight}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            {product.price.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>{product.stockQuantity.toLocaleString()}</TableCell>
                        <TableCell>{getStockBadge(product.stockQuantity)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(product)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteDialogProduct(product)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
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
