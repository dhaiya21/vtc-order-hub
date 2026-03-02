import type { Order } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useSeedData } from "@/hooks/useSeedData";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  Pending: {
    label: "Pending",
    className: "status-pending",
  },
  Confirmed: {
    label: "Confirmed",
    className: "status-confirmed",
  },
  Shipped: {
    label: "Shipped",
    className: "status-shipped",
  },
  Delivered: {
    label: "Delivered",
    className: "status-delivered",
  },
  Cancelled: {
    label: "Cancelled",
    className: "status-cancelled",
  },
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

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: "bg-gray-100 text-gray-700 border border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  subtitle,
  loading,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  subtitle?: string;
  loading?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{value}</p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderRow({ order }: { order: Order }) {
  const navigate = useNavigate();
  const handleNav = () =>
    navigate({
      to: "/invoice/$orderId",
      params: { orderId: order.orderId.toString() },
    });
  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-sm font-mono font-semibold text-primary">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNav();
          }}
          className="font-mono font-semibold hover:underline focus-visible:outline-none"
        >
          {formatOrderId(order.orderId)}
        </button>
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
      <td className="px-4 py-3 text-sm font-semibold text-foreground">
        {formatCurrency(order.totalAmount)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={order.status} />
      </td>
    </tr>
  );
}

export default function Dashboard() {
  useSeedData();
  const { actor, isFetching: actorLoading } = useActor();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => actor!.getDashboardStats(),
    enabled: !!actor && !actorLoading,
  });

  const loading = isLoading || actorLoading;

  const statCards = [
    {
      title: "Total Customers",
      value: stats ? Number(stats.totalCustomers).toLocaleString() : "—",
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      subtitle: "Registered accounts",
    },
    {
      title: "Total Orders",
      value: stats ? Number(stats.totalOrders).toLocaleString() : "—",
      icon: ShoppingCart,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      subtitle: "All time orders",
    },
    {
      title: "Total Revenue",
      value: stats ? formatCurrency(stats.totalRevenue) : "—",
      icon: TrendingUp,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      subtitle: "Gross revenue",
    },
    {
      title: "Low Stock",
      value: stats ? Number(stats.lowStockProducts).toLocaleString() : "—",
      icon: AlertTriangle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      subtitle: "Products < 500 units",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Smart Retail Order Management — VTC Order Hub
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
          <Package className="w-4 h-4" />
          New Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            Recent Orders
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => navigate({ to: "/orders" })}
          >
            View all <ArrowRight className="w-3 h-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? ["r0", "r1", "r2", "r3", "r4"].map((rowKey) => (
                      <tr key={rowKey} className="border-b border-border/50">
                        {["order", "customer", "date", "amount", "status"].map(
                          (col) => (
                            <td key={col} className="px-4 py-3">
                              <Skeleton className="h-4 w-24" />
                            </td>
                          ),
                        )}
                      </tr>
                    ))
                  : (stats?.recentOrders ?? []).map((order) => (
                      <OrderRow key={order.orderId.toString()} order={order} />
                    ))}
              </tbody>
            </table>
            {!loading &&
              (!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No orders yet. Create your first order to get started.
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
