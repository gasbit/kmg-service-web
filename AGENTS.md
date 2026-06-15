<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# KMG Service Web Agent Guide

## 1. Project Overview

`KMG-SERVICE-WEB` is the frontend application for KMG-SERVICE, a gas shop management system for shop owners and admins.

The frontend starts with an Admin-focused MVP and should remain ready for future roles such as Staff, Rider, and Accountant. The application is intended to help admins work with daily operations such as dashboard review, products, transactions, delivery queues, cylinder loans, inventory, and transaction history.

This project is frontend-only. Business rules, transaction boundaries, stock movements, authentication authority, authorization authority, audit logs, and data persistence belong to the backend.

## 2. Architecture Overview

The application uses Next.js App Router with a feature-oriented architecture.

Core architecture principles:

- Use Server Components for read-focused pages such as dashboard, product lists, transaction history, inventory, queue, and loan views.
- Use Client Components only for interactive UI such as forms, filters, dialogs, table actions, and status controls.
- Keep access tokens out of browser JavaScript. When implemented, auth should use httpOnly cookies through route handlers or server actions.
- Centralize backend communication through `src/lib/api`.
- Keep domain-specific UI, types, schemas, and API wrappers inside `src/features/<domain>`.
- Keep reusable shell and UI primitives inside `src/components`.
- Design screens as operational tools for repeated daily use, not marketing pages.

Current domain modules:

- `auth`
- `dashboard`
- `products`
- `transactions`
- `queues`
- `loans`
- `inventory`

## 3. Project Structure

```text
KMG-SERVICE-WEB/
  src/
    app/
      (auth)/
        login/
          page.tsx
      (app)/
        layout.tsx
        page.tsx
        dashboard/
        products/
        transactions/
        queues/
        loans/
        inventory/
      api/
        auth/
          login/
          logout/
      globals.css
    components/
      app-shell/
      ui/
    features/
      auth/
      dashboard/
      products/
      transactions/
      queues/
      loans/
      inventory/
    lib/
      api/
      auth/
      constants/
      format/
      hooks/
      utils/
    middleware.ts
```

Route groups:

- `(auth)` contains public authentication routes.
- `(app)` contains authenticated application routes and shared app layout.
- `api/auth/*` contains frontend route-handler entry points for auth flows.

Feature module convention:

- `*.api.ts` for feature API wrappers.
- `*.types.ts` for feature types.
- `*.schema.ts` for validation schemas when needed.
- UI files stay close to their feature when they are domain-specific.

## 4. Coding Standards

- Use TypeScript for all application code.
- Prefer named exports for shared components, utilities, and feature modules.
- Keep Server Components as the default. Add `"use client"` only when browser state, event handlers, effects, or client-only hooks are required.
- Keep UI components small and composable.
- Keep reusable primitives domain-neutral under `src/components/ui`.
- Keep feature-specific components inside `src/features/<domain>`.
- Use the `@/*` import alias for imports from `src`.
- Use Tailwind CSS and CSS variables for styling.
- Avoid putting source-of-truth business logic in the frontend.
- Avoid duplicating backend validation or status-transition authority. Frontend validation should be user-facing and defensive only.
- Prefer clear names over broad abstractions.
- Do not add new dependencies unless they clearly match the frontend architecture and are needed for the task.

## 5. Development Workflow

1. Read the relevant architecture/context document before making structural changes.
2. Identify the owning route, feature module, or shared layer before editing.
3. Keep changes scoped to the requested domain.
4. Add or update types near the feature that owns the data shape.
5. Put cross-cutting helpers in `src/lib` only when multiple features need them.
6. Run lint before finishing.
7. Run build when route structure, server/client boundaries, middleware, config, or shared imports change.
8. Leave unrelated files and user changes untouched.

For new pages:

- Add the route under `src/app`.
- Add domain-specific UI under `src/features/<domain>`.
- Use Server Components by default.
- Move interactive portions into small Client Components.

For new backend integration:

- Add shared response/error handling under `src/lib/api`.
- Add feature-specific wrapper functions under `src/features/<domain>/*.api.ts`.
- Keep auth/session concerns under `src/lib/auth` or `src/features/auth`.

## 6. Commands

Run commands from `KMG-SERVICE-WEB`.

```bash
npm run dev
```

Starts the local development server.

```bash
npm run lint
```

Runs ESLint.

```bash
npm run build
```

Creates a production build and checks Next.js route/type compilation.

```bash
npm run start
```

Starts the production server after a successful build.

## 7. Safety Rules

- Do not implement backend-owned business workflows in the frontend.
- Do not store JWT access tokens in `localStorage`, `sessionStorage`, or client-readable cookies.
- Do not make the frontend the source of truth for stock, loans, queues, pricing snapshots, or transaction status transitions.
- Do not bypass backend authorization with frontend-only checks.
- Do not hard-delete data from frontend flows unless the backend explicitly supports the operation.
- Do not introduce broad refactors while making narrow feature changes.
- Do not edit generated folders such as `.next` or `node_modules`.
- Do not commit secrets, credentials, local environment files, or production data.
- Do not run destructive git commands unless explicitly requested.

## 8. Domain Knowledge

KMG-SERVICE manages daily gas shop operations.

Primary user:

- `Admin`: shop owner/operator with access to all MVP functionality.

Future roles:

- `Staff`: shop employee with limited permissions.
- `Rider`: delivery worker who views queues and updates delivery progress.
- `Accountant`: finance/reporting role.

Main domains:

- Product Management: gas product catalog, brand, weight, exchange cost, selling price, full tank price, active status.
- Transaction Management: creates and tracks customer operations.
- Queue Management: delivery queue for delivery exchange transactions.
- Cylinder Loan Management: tracks borrowed cylinders, expected return, actual return, deposit, and loan status.
- Inventory Management: tracks full cylinders, empty cylinders, borrowed cylinders, and movement history.
- Dashboard: daily operational summary for pending work, queue, sales, loans, and stock.

Transaction types:

- `DELIVERY_EXCHANGE`: customer requests gas delivery and cylinder exchange.
- `WALK_IN_EXCHANGE`: customer exchanges cylinder at the shop.
- `BORROW_CYLINDER`: customer borrows a cylinder.
- `RETURN_CYLINDER`: customer returns a borrowed cylinder.
- `BUY_FULL_TANK`: customer buys a full tank or new cylinder.

Transaction statuses:

- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

Important boundary:

The frontend may guide the user and prevent obvious invalid actions in the UI, but the backend must remain the final authority for authentication, authorization, transaction validity, inventory movement, status changes, and audit history.
