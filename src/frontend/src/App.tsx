import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import CreateOrder from "@/pages/CreateOrder";
import Customers from "@/pages/Customers";
import Dashboard from "@/pages/Dashboard";
import Invoice from "@/pages/Invoice";
import Orders from "@/pages/Orders";
import Products from "@/pages/Products";
import Reports from "@/pages/Reports";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

// Layout with sidebar
function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

// Layout route
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: AppLayout,
});

// Index redirect
const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/dashboard",
  component: Dashboard,
});

const customersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/customers",
  component: Customers,
});

const productsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/products",
  component: Products,
});

const ordersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/orders",
  component: Orders,
});

const createOrderRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/create-order",
  component: CreateOrder,
});

const reportsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/reports",
  component: Reports,
});

// Invoice route - no sidebar layout
const invoiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invoice/$orderId",
  component: Invoice,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    dashboardRoute,
    customersRoute,
    productsRoute,
    ordersRoute,
    createOrderRoute,
    reportsRoute,
  ]),
  invoiceRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
