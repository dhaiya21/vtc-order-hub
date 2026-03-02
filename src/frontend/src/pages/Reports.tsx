import type { Order } from "@/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  Pending: { label: "Pending", color: "#d97706", bg: "#fef3c7" },
  Confirmed: { label: "Confirmed", color: "#2563eb", bg: "#dbeafe" },
  Shipped: { label: "Shipped", color: "#7c3aed", bg: "#ede9fe" },
  Delivered: { label: "Delivered", color: "#059669", bg: "#d1fae5" },
  Cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2" },
};

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface CustomerRevenue {
  name: string;
  company: string;
  total: number;
  orderCount: number;
}

function computeTopCustomers(orders: Order[]): CustomerRevenue[] {
  const map = orders.reduce(
    (acc, o) => {
      const key = o.customerId.toString();
      if (!acc[key]) {
        acc[key] = {
          name: o.customerName,
          company: o.companyName,
          total: 0,
          orderCount: 0,
        };
      }
      acc[key].total += o.totalAmount;
      acc[key].orderCount += 1;
      return acc;
    },
    {} as Record<string, CustomerRevenue>,
  );
  return Object.values(map)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

export default function Reports() {
  const { actor, isFetching: actorLoading } = useActor();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => actor!.getDashboardStats(),
    enabled: !!actor && !actorLoading,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => actor!.getOrders(),
    enabled: !!actor && !actorLoading,
  });

  const loading = statsLoading || ordersLoading || actorLoading;

  const statusCounts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topCustomers = computeTopCustomers(orders);
  const maxRevenue = topCustomers[0]?.total ?? 1;

  const summaryCards = [
    {
      title: "Total Customers",
      value: stats ? Number(stats.totalCustomers).toLocaleString() : "—",
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Orders",
      value: stats ? Number(stats.totalOrders).toLocaleString() : "—",
      icon: ShoppingCart,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: stats ? formatCurrency(stats.totalRevenue) : "—",
      icon: TrendingUp,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Low Stock Items",
      value: stats ? Number(stats.lowStockProducts).toLocaleString() : "—",
      icon: AlertTriangle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Reports & Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Business performance overview
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      {card.title}
                    </p>
                    {loading ? (
                      <Skeleton className="h-7 w-20" />
                    ) : (
                      <p className="text-xl font-bold text-foreground">
                        {card.value}
                      </p>
                    )}
                  </div>
                  <div className={`p-2 rounded-xl ${card.iconBg}`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              Order Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {["s1", "s2", "s3"].map((k) => (
                  <Skeleton key={k} className="h-8 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No orders to analyze yet
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                  const count = statusCounts[status] || 0;
                  if (count === 0) return null;
                  const pct = Math.round((count / orders.length) * 100);
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="text-sm text-foreground">
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {pct}%
                          </span>
                          <span className="text-sm font-bold text-foreground w-6 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: config.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 text-xs text-muted-foreground text-right">
                  Total: {orders.length} orders
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Top Customers by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {["t1", "t2", "t3"].map((k) => (
                  <Skeleton key={k} className="h-8 w-full" />
                ))}
              </div>
            ) : topCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No customer data yet
              </div>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((c, idx) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold w-5 text-center text-muted-foreground">
                      {idx + 1}
                    </span>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: "oklch(var(--sidebar))" }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate">
                          {c.name}
                        </span>
                        <span className="text-sm font-bold text-green-700 shrink-0 ml-2">
                          {formatCurrency(c.total)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(c.total / maxRevenue) * 100}%`,
                            backgroundColor: "oklch(0.58 0.18 145)",
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {c.company} · {c.orderCount} order
                        {c.orderCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full top customers table */}
      {topCustomers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Customer Revenue Detail
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {[
                      "#",
                      "Customer",
                      "Company",
                      "Orders",
                      "Total Revenue",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c, idx) => (
                    <tr
                      key={c.name}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-muted-foreground font-semibold">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {c.company}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {c.orderCount}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-700">
                        {formatCurrency(c.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
