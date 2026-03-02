import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Factory,
  LayoutDashboard,
  LogOut,
  Package,
  PlusCircle,
  ShoppingCart,
  Users,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/products", label: "Products", icon: Package },
  { path: "/orders", label: "Orders", icon: ShoppingCart },
  { path: "/create-order", label: "Create Order", icon: PlusCircle },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div
      className="w-64 min-h-screen flex flex-col shrink-0"
      style={{ backgroundColor: "oklch(var(--sidebar))" }}
    >
      {/* Logo */}
      <div
        className="px-6 py-5 border-b"
        style={{ borderColor: "oklch(var(--sidebar-border))" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "oklch(var(--sidebar-primary))" }}
          >
            <Factory
              className="w-5 h-5"
              style={{ color: "oklch(var(--sidebar-primary-foreground))" }}
            />
          </div>
          <div>
            <div
              className="text-sm font-bold leading-tight"
              style={{ color: "oklch(var(--sidebar-foreground))" }}
            >
              VTC ORDER HUB
            </div>
            <div
              className="text-xs leading-tight"
              style={{ color: "oklch(var(--sidebar-foreground) / 0.55)" }}
            >
              Vikas Trading Co.
            </div>
          </div>
        </div>
      </div>

      {/* Module label */}
      <div className="px-6 pt-4 pb-2">
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "oklch(var(--sidebar-foreground) / 0.4)" }}
        >
          Navigation
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            currentPath === item.path ||
            (item.path !== "/dashboard" && currentPath.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "text-sidebar-primary-foreground"
                  : "hover:text-sidebar-foreground",
              )}
              style={
                isActive
                  ? {
                      backgroundColor: "oklch(var(--sidebar-primary))",
                      color: "oklch(var(--sidebar-primary-foreground))",
                    }
                  : {
                      color: "oklch(var(--sidebar-foreground) / 0.7)",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "oklch(var(--sidebar-accent))";
                  (e.currentTarget as HTMLElement).style.color =
                    "oklch(var(--sidebar-accent-foreground))";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color =
                    "oklch(var(--sidebar-foreground) / 0.7)";
                }
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-3 py-4 border-t mt-auto"
        style={{ borderColor: "oklch(var(--sidebar-border))" }}
      >
        <div
          className="px-3 py-2.5 rounded-lg flex items-center gap-3"
          style={{ backgroundColor: "oklch(var(--sidebar-accent) / 0.5)" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: "oklch(var(--sidebar-primary))",
              color: "oklch(var(--sidebar-primary-foreground))",
            }}
          >
            AD
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-xs font-semibold truncate"
              style={{ color: "oklch(var(--sidebar-foreground))" }}
            >
              Admin User
            </div>
            <div
              className="text-xs truncate"
              style={{ color: "oklch(var(--sidebar-foreground) / 0.5)" }}
            >
              admin@vtc.com
            </div>
          </div>
          <LogOut
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: "oklch(var(--sidebar-foreground) / 0.4)" }}
          />
        </div>
      </div>
    </div>
  );
}
