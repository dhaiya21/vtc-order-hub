import type { Customer } from "@/backend";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const EMPTY_FORM = {
  customer_name: "",
  company_name: "",
  phone: "",
  email: "",
  address: "",
  gst_number: "",
};

function formatDate(ts: bigint) {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Customers() {
  const { actor, isFetching: actorLoading } = useActor();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => actor!.getCustomers(search),
    enabled: !!actor && !actorLoading,
  });

  const addMutation = useMutation({
    mutationFn: (data: typeof EMPTY_FORM) =>
      actor!.addCustomer(
        data.customer_name,
        data.company_name,
        data.phone,
        data.email,
        data.address,
        data.gst_number,
      ),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success("Customer added successfully");
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        setShowModal(false);
      } else {
        toast.error(result.message);
      }
    },
    onError: () => toast.error("Failed to add customer"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof EMPTY_FORM) =>
      actor!.updateCustomer(
        editCustomer!.id,
        data.customer_name,
        data.company_name,
        data.phone,
        data.email,
        data.address,
        data.gst_number,
      ),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success("Customer updated successfully");
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        setShowModal(false);
        setEditCustomer(null);
      } else {
        toast.error(result.message);
      }
    },
    onError: () => toast.error("Failed to update customer"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: bigint) => actor!.deleteCustomer(id),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success("Customer deleted");
        queryClient.invalidateQueries({ queryKey: ["customers"] });
      } else {
        toast.error(result.message);
      }
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete customer"),
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditCustomer(null);
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setForm({
      customer_name: c.customerName,
      company_name: c.companyName,
      phone: c.phone,
      email: c.email,
      address: c.address,
      gst_number: c.gstNumber,
    });
    setEditCustomer(c);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCustomer) {
      updateMutation.mutate(form);
    } else {
      addMutation.mutate(form);
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;
  const loading = isLoading || actorLoading;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Customer Master
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage customer accounts and contact details
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
          Add Customer
        </Button>
      </div>

      {/* Search + table */}
      <div className="rounded-xl border border-border bg-card shadow-xs">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${customers.length} customers`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {[
                  "Customer",
                  "Company",
                  "Phone",
                  "Email",
                  "GST Number",
                  "Verified",
                  "Joined",
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
                ? ["s0", "s1", "s2", "s3", "s4"].map((key) => (
                    <tr key={key} className="border-b border-border/50">
                      {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"].map(
                        (c) => (
                          <td key={c} className="px-4 py-3">
                            <Skeleton className="h-4 w-20" />
                          </td>
                        ),
                      )}
                    </tr>
                  ))
                : customers.map((c) => (
                    <tr
                      key={c.id.toString()}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{
                              backgroundColor: "oklch(var(--sidebar))",
                            }}
                          >
                            {c.customerName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {c.customerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {c.companyName || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{c.phone}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {c.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {c.gstNumber || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {c.phoneVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                            <XCircle className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(c)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(c)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!loading && customers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No customers found</p>
              <p className="text-xs mt-1">
                {search
                  ? "Try a different search term"
                  : "Add your first customer to get started"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="customer_name">
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer_name"
                    required
                    value={form.customer_name}
                    onChange={(e) =>
                      setForm({ ...form, customer_name: e.target.value })
                    }
                    placeholder="Rajesh Kumar"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={form.company_name}
                    onChange={(e) =>
                      setForm({ ...form, company_name: e.target.value })
                    }
                    placeholder="Kumar Packaging Ltd"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    required
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="9876543210"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="rajesh@kumar.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  rows={2}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Mumbai, Maharashtra"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gst_number">GST Number</Label>
                <Input
                  id="gst_number"
                  value={form.gst_number}
                  onChange={(e) =>
                    setForm({ ...form, gst_number: e.target.value })
                  }
                  placeholder="27AABCV1234F1Z5"
                  className="font-mono uppercase"
                />
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
                {editCustomer ? "Update Customer" : "Add Customer"}
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
            <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deleteTarget?.customerName}</strong> and all associated
              data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
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
