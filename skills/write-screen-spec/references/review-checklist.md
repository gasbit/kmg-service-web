# Screen specification review checklist

## Product and workflow

- [ ] Purpose, user outcome, route, role, entry points, and exits are explicit.
- [ ] In-scope and out-of-scope behavior is clear.
- [ ] Primary workflow and consequential alternate paths are complete.
- [ ] Assumptions, proposals, conflicts, and open decisions are visible.

## Architecture and ownership

- [ ] Owning route and feature module are identified.
- [ ] Server and Client Component boundaries are justified.
- [ ] Existing shared UI, icon, and app-shell components were inspected and reused where suitable.
- [ ] Missing reusable patterns are proposed in the correct shared layer.
- [ ] Authentication and sensitive data stay behind server-side boundaries.

## Data and API

- [ ] Every decision-relevant datum has a source, format, null behavior, and fallback.
- [ ] Read and mutation operations map to confirmed API contracts or are recorded as gaps.
- [ ] Current master data is distinguished from historical snapshots.
- [ ] Loading, refresh, caching, stale data, and concurrency behavior are addressed.
- [ ] Backend-owned validation and business authority are not assigned to the frontend.

## UI behavior

- [ ] Populated, empty, loading, error, unauthorized, forbidden, and not-found states are covered where relevant.
- [ ] Mutation pending, success, failure, and duplicate submission behavior are defined.
- [ ] Filters, search, sort, pagination, dialogs, toasts, navigation, and destructive confirmations are unambiguous.
- [ ] Important Thai UI copy is explicit.

## Responsive and accessibility

- [ ] Desktop and narrow-screen behavior are specified.
- [ ] Dense tables have an intentional mobile strategy.
- [ ] Labels, headings, focus, keyboard use, errors, dialogs, and status indicators are accessible.
- [ ] Color is not the only carrier of meaning.

## Acceptance and risk

- [ ] Acceptance criteria are observable and testable.
- [ ] Happy path, empty state, meaningful failure, permissions, and mobile behavior are tested conceptually.
- [ ] API gaps, implementation mismatches, breaking changes, and unresolved risks are summarized.
