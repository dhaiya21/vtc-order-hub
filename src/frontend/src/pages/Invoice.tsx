import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Factory, Printer } from "lucide-react";

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
    month: "long",
    year: "numeric",
  });
}

const STATUS_CONFIG: Record<string, string> = {
  Pending: "status-pending",
  Confirmed: "status-confirmed",
  Shipped: "status-shipped",
  Delivered: "status-delivered",
  Cancelled: "status-cancelled",
};

export default function Invoice() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const { actor, isFetching: actorLoading } = useActor();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ["invoice", orderId],
    queryFn: () => actor!.getInvoice(BigInt(orderId)),
    enabled: !!actor && !actorLoading && !!orderId,
  });

  if (isLoading || actorLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-lg font-semibold text-destructive">
          Invoice not found
        </p>
        <Button variant="outline" onClick={() => navigate({ to: "/orders" })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const subtotal = order.items.reduce(
    (s, i) => s + i.price * Number(i.quantity),
    0,
  );
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      {/* Toolbar */}
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between no-print">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: "/orders" })}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>
        <Button
          size="sm"
          onClick={() => window.print()}
          className="gap-2"
          style={{
            backgroundColor: "oklch(var(--sidebar-primary))",
            color: "oklch(var(--sidebar-primary-foreground))",
          }}
        >
          <Printer className="w-4 h-4" />
          Print Invoice
        </Button>
      </div>

      {/* Invoice document */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden print-area">
        {/* Header */}
        <div
          className="p-6 flex items-start justify-between"
          style={{ backgroundColor: "oklch(var(--sidebar))" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "oklch(var(--sidebar-primary))" }}
            >
              <Factory
                className="w-7 h-7"
                style={{
                  color: "oklch(var(--sidebar-primary-foreground))",
                }}
              />
            </div>
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: "oklch(var(--sidebar-foreground))" }}
              >
                Vikas Trading Co.
              </h1>
              <p
                className="text-sm mt-0.5"
                style={{ color: "oklch(var(--sidebar-foreground) / 0.7)" }}
              >
                PET Bottle Manufacturing & Wholesale
              </p>
              <p
                className="text-xs mt-0.5 font-mono"
                style={{ color: "oklch(var(--sidebar-foreground) / 0.5)" }}
              >
                GST: 27AABCV1234F1Z5
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-2xl font-bold tracking-wide"
              style={{ color: "oklch(var(--sidebar-primary))" }}
            >
              INVOICE
            </div>
            <div
              className="text-sm mt-1 font-mono font-semibold"
              style={{ color: "oklch(var(--sidebar-foreground))" }}
            >
              {formatOrderId(order.orderId)}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "oklch(var(--sidebar-foreground) / 0.7)" }}
            >
              {formatDate(order.orderDate)}
            </div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${STATUS_CONFIG[order.status] || ""}`}
              >
                {order.status === "Delivered" && (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Bill to / From */}
        <div className="grid grid-cols-2 gap-0 border-b border-gray-200">
          <div className="p-6 border-r border-gray-200">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Bill To
            </p>
            <p className="font-bold text-gray-800">{order.customerName}</p>
            <p className="text-sm text-gray-600 mt-0.5">{order.companyName}</p>
          </div>
          <div className="p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              From
            </p>
            <p className="font-bold text-gray-800">Vikas Trading Co.</p>
            <p className="text-sm text-gray-600 mt-0.5">
              Industrial Area, Maharashtra
            </p>
            <p className="text-sm text-gray-600">+91 98765 43210</p>
          </div>
        </div>

        {/* Line items */}
        <div className="px-6 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-white"
                style={{ backgroundColor: "oklch(var(--sidebar))" }}
              >
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide rounded-tl">
                  #
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                  Product Description
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide">
                  Unit Price
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide">
                  Qty
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide rounded-tr">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr
                  key={item.id.toString()}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-3 text-gray-400">{idx + 1}</td>
                  <td className="px-3 py-3 font-medium text-gray-800">
                    {item.productName}
                  </td>
                  <td className="px-3 py-3 text-right text-gray-600">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-3 py-3 text-right text-gray-600">
                    {Number(item.quantity).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-gray-800">
                    {formatCurrency(item.price * Number(item.quantity))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-6 pb-6">
          <div className="flex justify-end">
            <div className="w-64 border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 border-b border-gray-200">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm font-medium text-gray-800">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between px-4 py-2.5 border-b border-gray-200">
                <span className="text-sm text-gray-500">GST @ 18%</span>
                <span className="text-sm font-medium text-gray-800">
                  {formatCurrency(gst)}
                </span>
              </div>
              <div
                className="flex justify-between px-4 py-3"
                style={{ backgroundColor: "oklch(var(--accent) / 0.3)" }}
              >
                <span className="text-sm font-bold text-gray-800">
                  Grand Total
                </span>
                <span
                  className="text-base font-bold"
                  style={{ color: "oklch(0.45 0.12 85)" }}
                >
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t border-gray-200 text-center"
          style={{ backgroundColor: "oklch(var(--muted) / 0.5)" }}
        >
          <p className="text-sm text-gray-500 font-medium">
            Thank you for your business!
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Vikas Trading Co. · PET Bottle Manufacturing & Wholesale ·
            Maharashtra, India
          </p>
        </div>
      </div>

      {/* Branding */}
      <p className="text-center text-xs text-muted-foreground mt-6 no-print">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline hover:text-foreground"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
