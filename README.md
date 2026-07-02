# InvenEase — Inventory Management System

A full-featured inventory management web application built with [TanStack Start](https://tanstack.com/start). Manage products, stock levels, suppliers, warehouses, purchase orders, sales orders, and stock transfers across multiple locations with role-based access control.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | TanStack Start (React 19, SSR) |
| **Routing** | TanStack Router (file-based) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Database** | PostgreSQL via Prisma |
| **Auth** | Better Auth (email/password, GitHub, Google OAuth) |
| **Email** | React Email + nodemailer |
| **Validation** | Zod v4 + T3 Env |
| **Forms** | TanStack React Form |
| **Tooling** | Biome / Ultracite, Vitest, Vite 8 |

## Features

- **Authentication** — email/password with email verification, GitHub & Google OAuth, password reset
- **Role-Based Access Control** — 4 roles (superAdmin, admin, manager, staff) with granular CRUD permissions per domain
- **Product Management** — CRUD with auto-generated SKUs, search, pagination, hierarchical categories
- **Category Management** — Hierarchical categories (parent/child) with CRUD
- **Supplier Management** — Full supplier profiles with contact details
- **Warehouse Management** — Multi-warehouse support
- **Inventory Tracking** — Stock levels per product per warehouse with reserved quantities
- **Stock Movements** — Complete audit trail for all stock changes (receive, sell, adjust, transfer)
- **Stock Transfers** — Transfer stock between warehouses (PENDING → COMPLETED workflow)
- **Purchase Orders** — Full lifecycle (DRAFT → SENT → PARTIAL → RECEIVED → CANCELLED)
- **Sales Orders** — Order lifecycle (PENDING → CONFIRMED → PICKING → SHIPPED → DELIVERED → CANCELLED)
- **Audit Logging** — Comprehensive audit trail tracking all entity changes
- **Email Notifications** — Password reset, email verification, email change via React Email templates
- **User Profile & Settings** — Edit profile, change password, manage sessions, delete account
- **Dark Mode** — Theme toggle with class-based dark mode

## Getting Started

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL, Better Auth secret, SMTP, and OAuth credentials

# Generate Prisma client and push schema
bun run db:generate
bun run db:push

# Start dev server
bun run dev
```

The app runs at `http://localhost:3000`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_URL` | Application URL (e.g. `http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | Better Auth secret key |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address for emails |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

## Database

Uses **Prisma** with **PostgreSQL**. The schema is defined in `prisma/schema.prisma` with 18 models (User, Session, Account, Category, Supplier, Product, Warehouse, InventoryItem, StockMovement, StockTransfer, StockTransferItem, Customer, Order, OrderItem, PurchaseOrder, PurchaseOrderItem, AuditLog, Verification).

```bash
bun run db:generate   # Generate Prisma client
bun run db:push       # Push schema to database
bun run db:migrate    # Create a new migration
bun run db:studio     # Open Prisma Studio
bun run db:seed       # Seed the database
```

## Role-Based Access Control

Four roles with granular permissions across all domains:

| Resource | superAdmin | admin | manager | staff |
|----------|-----------|-------|---------|-------|
| Product | CRUD | CRUD | CRU | R |
| Category | CRUD | CRUD | CRU | R |
| Supplier | CRUD | CRUD | CRU | R |
| Inventory | read, adjust, transfer | read, adjust, transfer | read, adjust, transfer | read, adjust |
| Order | CRUD + approve, cancel | CRUD + approve, cancel | CRUD + approve, cancel | create, read |
| Purchase Order | CRUD + approve, cancel | CRUD + approve, cancel | create, read, update | — |
| Warehouse | CRUD | CRUD | CRU | R |
| User | full control | full except impersonate-admins | list | — |

Permissions are defined in `src/lib/permissions.ts`. Auth guards and middleware are in `src/middleware.ts`.

## Scripts

| Script | Purpose |
|--------|---------|
| `dev` | Start dev server on port 3000 |
| `build` | Build for production |
| `preview` | Preview production build |
| `test` | Run tests with Vitest |
| `check` | Lint & format check with Ultracite/Biome |
| `fix` | Auto-fix lint & formatting issues |
| `doctor` | Run React Doctor analysis |
| `generate-routes` | Regenerate TanStack Router route tree |
| `db:*` | Prisma database commands |

## Project Structure

```
src/
├── components/       # Reusable UI components (shadcn/ui + custom)
│   ├── ui/           # ~40 base UI components
│   └── shared/       # App-wide components (header, sidebar, etc.)
├── features/         # Domain-driven feature modules
│   ├── auth/         # Auth forms, schema, server functions
│   ├── categories/   # Categories CRUD
│   ├── email/        # React Email templates
│   ├── products/     # Products CRUD
│   ├── profile/      # Profile editing
│   ├── purchase-orders/
│   ├── settings/     # Password, sessions, danger zone
│   ├── stock-transfers/
│   ├── suppliers/    # Suppliers CRUD
│   └── warehouses/   # Warehouses CRUD
├── hooks/            # Custom React hooks
├── integrations/     # App-level providers/context
├── lib/              # Core libraries (auth, auth-client, permissions)
├── routes/           # File-based TanStack Router routes
│   ├── _auth/        # Sign-in, sign-up, forgot/reset password
│   └── _app/         # Dashboard, products, categories, etc.
└── middleware.ts     # Auth & permission middleware
```

## Deployment

Deployed on **Vercel**. The `vercel.json` config uses the Nitro preset:

```bash
bun run build
```
