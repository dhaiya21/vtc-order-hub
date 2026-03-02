# Smart Retail Order Management Platform – VTC Order Hub

## Current State

New project with no prior frontend or backend implementation. The Caffeine/ICP platform provides the scaffold (main.tsx, hooks, shadcn components).

## Requested Changes (Diff)

### Add

- Motoko backend actor (`src/backend/main.mo`) with full CRUD for Customers, Products, Orders, Dashboard stats, and demo data seeding
- React frontend with ERP-style sidebar layout (dark navy sidebar, white content area)
- Dashboard page: KPI stat cards (total customers, orders, revenue, low-stock products) and recent orders table
- Customer Master page: searchable table, add/edit modal, delete confirmation, phone-verified badge
- Product Inventory page: category filter dropdown, stock color-coding, full CRUD modal
- Orders page: table with inline status dropdown (Pending/Confirmed/Shipped/Delivered/Cancelled)
- Create Order page: customer search autocomplete, product selector cart, running total, place order action
- Reports page: order status breakdown with progress bars, top customers by revenue
- Invoice page: printable full invoice with GST breakdown (18%), order details, company header
- Sidebar navigation with icons for all major sections

### Modify

- `index.css`: OKLCH design tokens for ERP industrial aesthetic (navy primary, amber accent)
- `tailwind.config.js`: Plus Jakarta Sans font, theme extensions

### Remove

Nothing removed.

## Implementation Plan

1. Write Motoko backend with types: Customer, Product, Order, OrderItem, DashboardStats, CreateOrderItem
2. Compile Motoko to WASM, generate Candid IDL, generate TypeScript bindings via @caffeinelabs/bindgen
3. Build App.tsx with QueryClientProvider, BrowserRouter, Toaster, sidebar layout, and all routes
4. Build all page components wired to backend via useActor + React Query
5. Verify typecheck and build pass
