# KMG-SERVICE screen domain rules

Read the repository's approved business documents for complete rules. Use this reference as a guardrail, not a replacement for those sources.

## Cross-domain authority

- The backend is authoritative for authentication, authorization, transaction validity, status changes, inventory movements, queue ordering, loan state, audit history, and persistence.
- Frontend validation guides users and blocks obvious mistakes but does not duplicate or replace backend validation.
- Keep access tokens out of browser JavaScript, `localStorage`, `sessionStorage`, and client-readable cookies.
- Represent backend `BigInt` identifiers as strings at the frontend contract boundary.
- Preserve historical customer, product, and price snapshots in transaction history.
- Prefer deactivation or soft delete for historical master data. Do not specify hard-delete flows unless the backend contract explicitly supports them.

## Products

- Show brand, weight, exchange cost, exchange selling price, full-tank price, active status, and images only when supported by the contract.
- Inactive products remain visible where historical context requires them but cannot be selected for new transactions.
- Price changes affect new transactions and must not rewrite historical snapshots.

## Transactions

- Supported types are `DELIVERY_EXCHANGE`, `WALK_IN_EXCHANGE`, `BORROW_CYLINDER`, `RETURN_CYLINDER`, and `BUY_FULL_TANK` unless approved sources change.
- A transaction may contain multiple items.
- Do not calculate or authorize final totals, inventory effects, status transitions, or snapshots solely in the browser.
- Make customer fields and product requirements conditional on the selected transaction type only when confirmed by business rules or API schemas.

## Queues

- Delivery exchange transactions create delivery queue work.
- UI controls may guide the expected progression, but the backend decides valid transitions and concurrency outcomes.
- Surface stale-state or conflict failures rather than assuming a status update succeeded.

## Cylinder loans

- Show customer snapshot, product, quantity, borrow date, expected return, actual return, deposit, and loan status when supplied.
- A return must reference a valid existing loan through backend-supported behavior.
- The backend owns remaining quantity, return validity, inventory movement, and loan status.

## Inventory

- Separate full, empty, and loaned quantities.
- Treat balances as read models from the backend; never make browser state the stock source of truth.
- Display movement history when traceability matters. Direct adjustment requires an explicit backend operation, authorization, reason, and audit behavior.

## Dashboard

- Keep dashboard operations read-only unless an action is explicitly part of another supported workflow.
- Define the date basis, timezone, refresh behavior, and empty or partial-data behavior for each metric.
- Do not derive financial or stock truth differently from backend-provided summaries.

## Roles

- MVP primarily supports `Admin`; future roles include `Staff`, `Rider`, and `Accountant`.
- Do not promise future-role behavior without an approved permission contract.
- Hiding an action is usability behavior, not authorization enforcement.
