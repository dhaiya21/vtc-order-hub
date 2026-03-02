import type { Product } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  "PET Bottles",
  "Water Bottles",
  "Oil Bottles",
  "Pharma Bottles",
  "Cosmetic Bottles",
  "Plastic Containers",
  "Custom Packaging",
];

const EMPTY_FORM = {
  name: "",
  category: "PET Bottles",
  price: "",
  stock_quantity: "",
};

function StockBadge({ qty }: { qty: bigint }) {
  const n = Number(qty);
  if (n < 200) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
        <AlertTriangle className="w-3 h-3" />
        {n.toLocaleString()}
      </span>
    );
  }
  if (n < 500) {
    return (
      <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-md">
        {n.toLocaleString()}
      </span>
    );
  }
  return (
    <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
      {n.toLocaleString()}
    </span>
  );
}

export default function Products() {
  const { actor, isFetching: actorLoading } = useActor();
  const queryClient = useQueryClient();
  const [filterCat, setFilterCat] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => actor!.getProducts(),
    enabled: !!actor && !actorLoading,
  });

  const addMutation = useMutation({
    mutationFn: (data: typeof EMPTY_FORM) =>
      actor!.addProduct(
        data.name,
        data.category,
        Number.parseFloat(data.price),
        BigInt(Number.parseInt(data.stock_quantity)),
      ),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success("Product added successfully");
        queryClient.invalidateQueries({ queryKey: ["products"] });
        setShowModal(false);
      } else {
        toast.error(result.message);
      }
    },
    onError: () => toast.error("Failed to add product"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof EMPTY_FORM) =>
      actor!.updateProduct(
        editProduct!.productId,
        data.name,
        data.category,
        Number.parseFloat(data.price),
        BigInt(Number.parseInt(data.stock_quantity)),
      ),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success("Product updated successfully");
        queryClient.invalidateQueries({ queryKey: ["products"] });
        setShowModal(false);
        setEditProduct(null);
      } else {
        toast.error(result.message);
      }
    },
    onError: () => toast.error("Failed to update product"),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: bigint) => actor!.deleteProduct(productId),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success("Product deleted");
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast.error(result.message);
      }
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditProduct(null);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      category: p.category,
      price: p.price.toString(),
      stock_quantity: Number(p.stockQuantity).toString(),
    });
    setEditProduct(p);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editProduct) {
      updateMutation.mutate(form);
    } else {
      addMutation.mutate(form);
    }
  };

  const filtered =
    filterCat === "all"
      ? products
      : products.filter((p) => p.category === filterCat);

  const isPending = addMutation.isPending || updateMutation.isPending;
  const loading = isLoading || actorLoading;

  // Category count map
  const catCounts = products.reduce(
    (acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Product & Inventory
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage PET bottle products and stock levels
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2"
          style={{
            backgroundColor: "oklch(var(--sidebar-primary))",
            color: "oklch(var(--sidebar-primary-foreground))",
          }}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs">
        <div className="p-4 border-b border-border flex items-center gap-3 flex-wrap">
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Categories ({products.length})
              </SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat} ({catCounts[cat] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground ml-auto">
            {loading ? "Loading…" : `${filtered.length} products`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {["Product", "Category", "Unit Price", "Stock", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loading
                ? ["p0", "p1", "p2", "p3", "p4"].map((key) => (
                    <tr key={key} className="border-b border-border/50">
                      {["c1", "c2", "c3", "c4", "c5"].map((c) => (
                        <td key={c} className="px-4 py-3">
                          <Skeleton className="h-4 w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((p) => (
                    <tr
                      key={p.productId.toString()}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Package className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">
                        ₹{p.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <StockBadge qty={p.stockQuantity} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(p)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No products found</p>
              <p className="text-xs mt-1">
                {filterCat !== "all"
                  ? "No products in this category"
                  : "Add your first product"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="500ml PET Bottle"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => setForm({ ...form, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price">
                    Price (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="4.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stock_quantity">
                    Stock Qty <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="stock_quantity"
                    required
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) =>
                      setForm({ ...form, stock_quantity: e.target.value })
                    }
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                style={{
                  backgroundColor: "oklch(var(--sidebar-primary))",
                  color: "oklch(var(--sidebar-primary-foreground))",
                }}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editProduct ? "Update Product" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.productId)
              }
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
