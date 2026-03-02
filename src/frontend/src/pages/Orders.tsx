import type { Order } from "@/backend";
import { Button } from "@/components/ui/button";
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
import { useNavigate } from "@tanstack/react-router";
import { Clock, FileText, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const STATUS_CONFIG: Record<string, string> = {
  Pending: "status-pending",
  Confirmed: "status-confirmed",
  Shipped: "status-shipped",
  Delivered: "status-delivered",
  Cancelled: "status-cancelled",
};

function formatOrderId(id: bigint) {
  return `#ORD${Number(id).toString().padStart(4, "0")}`;
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(ts: bigint) {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function OrderRow({
  order,
  onStatusChange,
  onViewInvoice,
  isUpdating,
}: {
  order: Order;
  onStatusChange: (orderId: bigint, status: string) => void;
  onViewInvoice: (orderId: bigint) => void;
  isUpdating: boolean;
}) {
  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-sm font-mono font-semibold text-primary">
        {formatOrderId(order.orderId)}
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-foreground">
          {order.customerName}
        </div>
        <div className="text-xs text-muted-foreground">{order.companyName}</div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(order.orderDate)}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-foreground">
        {formatCurrency(order.totalAmount)}
      </td>
      <td className="px-4 py-3">
        <Select
          value={order.status}
          onValueChange={(val) => onStatusChange(order.orderId, val)}
          disabled={isUpdating}
        >
          <SelectTrigger
            className={`w-32 h-7 text-xs border px-2 ${STATUS_CONFIG[order.status] || ""}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          onClick={() => onViewInvoice(order.orderId)}
        >
          <FileText className="w-3 h-3" />
          Invoice
        </Button>
      </td>
    </tr>
  );
}

export default function Orders() {
  const { actor, isFetching: actorLoading } = useActor();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => actor!.getOrders(),
    enabled: !!actor && !actorLoading,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: bigint;
      status: string;
    }) => actor!.updateOrderStatus(orderId, status),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success("Order status updated");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      } else {
        toast.error(result.message);
      }
    },
    onError: () => toast.error("Failed to update order status"),
  });

  const loading = isLoading || actorLoading;

  const statusCounts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage all customer orders
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: "/create-order" })}
          className="gap-2"
          style={{
            backgroundColor: "oklch(var(--sidebar-primary))",
            color: "oklch(var(--sidebar-primary-foreground))",
          }}
        >
          <Plus className="w-4 h-4" />
          Create Order
        </Button>
      </div>

      {/* Status summary pills */}
      {!loading && orders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) =>
            statusCounts[s] ? (
              <span
                key={s}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${STATUS_CONFIG[s]}`}
              >
                {s}
                <span className="font-bold">{statusCounts[s]}</span>
              </span>
            ) : null,
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {[
                  "Order ID",
                  "Customer",
                  "Date",
                  "Items",
                  "Amount",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? ["o0", "o1", "o2", "o3", "o4"].map((key) => (
                    <tr key={key} className="border-b border-border/50">
                      {["c1", "c2", "c3", "c4", "c5", "c6", "c7"].map((c) => (
                        <td key={c} className="px-4 py-3">
                          <Skeleton className="h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.map((order) => (
                    <OrderRow
                      key={order.orderId.toString()}
                      order={order}
                      onStatusChange={(orderId, status) =>
                        updateStatusMutation.mutate({ orderId, status })
                      }
                      onViewInvoice={(orderId) =>
                        navigate({
                          to: "/invoice/$orderId",
                          params: { orderId: orderId.toString() },
                        })
                      }
                      isUpdating={updateStatusMutation.isPending}
                    />
                  ))}
            </tbody>
          </table>
          {!loading && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No orders yet</p>
              <p className="text-xs mt-1">
                Create your first order to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
