import type { Customer, Product } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Loader2,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  User,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface CartItem {
  product: Product;
  quantity: number;
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CreateOrder() {
  const { actor, isFetching: actorLoading } = useActor();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: customers = [] } = useQuery({
    queryKey: ["customer-search", customerSearch],
    queryFn: () => actor!.searchCustomers(customerSearch),
    enabled: !!actor && !actorLoading && customerSearch.length > 1,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => actor!.getProducts(),
    enabled: !!actor && !actorLoading,
  });

  const createOrderMutation = useMutation({
    mutationFn: () =>
      actor!.createOrder(
        selectedCustomer!.id,
        cart.map((item) => ({
          productId: item.product.productId,
          quantity: BigInt(item.quantity),
        })),
      ),
    onSuccess: (result) => {
      if (result.ok && result.orderId !== undefined) {
        toast.success("Order placed successfully!");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        navigate({
          to: "/invoice/$orderId",
          params: { orderId: result.orderId.toString() },
        });
      } else {
        toast.error(result.message);
      }
    },
    onError: () => toast.error("Failed to create order"),
  });

  const selectCustomer = useCallback((c: Customer) => {
    setSelectedCustomer(c);
    setCustomerSearch(c.customerName);
    setShowDropdown(false);
  }, []);

  const addToCart = () => {
    if (!selectedProductId) return;
    const product = products.find(
      (p) => p.productId.toString() === selectedProductId,
    );
    if (!product) return;
    const qty = Number.parseInt(quantity) || 1;
    if (qty <= 0) return;

    setCart((prev) => {
      const existing = prev.find(
        (i) => i.product.productId === product.productId,
      );
      if (existing) {
        return prev.map((i) =>
          i.product.productId === product.productId
            ? { ...i, quantity: i.quantity + qty }
            : i,
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    setSelectedProductId("");
    setQuantity("1");
  };

  const removeFromCart = (productId: bigint) => {
    setCart((prev) => prev.filter((i) => i.product.productId !== productId));
  };

  const updateQty = (productId: bigint, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product.productId === productId ? { ...i, quantity: qty } : i,
      ),
    );
  };

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const canPlaceOrder = selectedCustomer !== null && cart.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Order</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select a customer, add products, and place the order
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Steps */}
        <div className="xl:col-span-2 space-y-4">
          {/* Step 1: Customer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Select Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customer by name…"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowDropdown(true);
                      if (!e.target.value) setSelectedCustomer(null);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="pl-9"
                  />
                </div>
                {showDropdown && customers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-52 overflow-y-auto">
                    {customers.map((c) => (
                      <button
                        key={c.id.toString()}
                        type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-muted/60 transition-colors border-b border-border/50 last:border-0"
                        onClick={() => selectCustomer(c)}
                      >
                        <div className="text-sm font-medium text-foreground">
                          {c.customerName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {c.companyName} · {c.phone}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedCustomer && (
                <div
                  className="mt-3 p-3 rounded-lg border"
                  style={{
                    backgroundColor: "oklch(var(--accent) / 0.3)",
                    borderColor: "oklch(var(--accent))",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor: "oklch(var(--sidebar))" }}
                    >
                      {selectedCustomer.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs flex-1">
                      <div>
                        <span className="text-muted-foreground">Name:</span>{" "}
                        <strong>{selectedCustomer.customerName}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Company:</span>{" "}
                        {selectedCustomer.companyName}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>{" "}
                        {selectedCustomer.phone}
                      </div>
                      <div>
                        <span className="text-muted-foreground">GST:</span>{" "}
                        <span className="font-mono">
                          {selectedCustomer.gstNumber || "—"}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Address:</span>{" "}
                        {selectedCustomer.address}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Add Products */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Add Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="sr-only">Product</Label>
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          productsLoading
                            ? "Loading products…"
                            : "Select a product…"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem
                          key={p.productId.toString()}
                          value={p.productId.toString()}
                        >
                          <div className="flex items-center justify-between gap-4 w-full">
                            <span>{p.name}</span>
                            <span className="text-muted-foreground text-xs ml-auto">
                              ₹{p.price.toFixed(2)} ·{" "}
                              {Number(p.stockQuantity).toLocaleString()} in
                              stock
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20">
                  <Label className="sr-only">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Qty"
                  />
                </div>
                <Button
                  type="button"
                  onClick={addToCart}
                  disabled={!selectedProductId}
                  style={{
                    backgroundColor: "oklch(var(--sidebar-primary))",
                    color: "oklch(var(--sidebar-primary-foreground))",
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Cart */}
          {cart.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  Order Items ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/40 border-y border-border">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Product
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Unit Price
                      </th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Qty
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Subtotal
                      </th>
                      <th className="px-4 py-2.5 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr
                        key={item.product.productId.toString()}
                        className="border-b border-border/50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {item.product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                          ₹{item.product.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQty(
                                item.product.productId,
                                Number.parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-20 mx-auto text-center h-8"
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">
                          {formatCurrency(item.product.price * item.quantity)}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              removeFromCart(item.product.productId)
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Customer
                </p>
                {selectedCustomer ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "oklch(var(--sidebar))" }}
                    >
                      {selectedCustomer.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {selectedCustomer.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCustomer.companyName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="text-sm">No customer selected</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Items
                </p>
                {cart.length === 0 ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm">No items added</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {cart.map((item) => (
                      <div
                        key={item.product.productId.toString()}
                        className="flex justify-between text-xs"
                      >
                        <span className="text-muted-foreground truncate mr-2">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="font-medium shrink-0">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total ({cart.reduce((s, i) => s + i.quantity, 0)} units)
                  </span>
                  <span className="font-bold text-base">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                className="w-full gap-2"
                disabled={!canPlaceOrder || createOrderMutation.isPending}
                onClick={() => createOrderMutation.mutate()}
                style={
                  canPlaceOrder
                    ? {
                        backgroundColor: "oklch(0.58 0.18 145)",
                        color: "white",
                      }
                    : {}
                }
              >
                {createOrderMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {createOrderMutation.isPending
                  ? "Placing Order…"
                  : "Place Order & View Invoice"}
              </Button>
              {!canPlaceOrder && (
                <p className="text-xs text-muted-foreground text-center">
                  {!selectedCustomer
                    ? "Select a customer to continue"
                    : "Add at least one product"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
