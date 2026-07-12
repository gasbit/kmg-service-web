---
name: write-screen-spec
description: Create, update, and review implementation-ready frontend screen specifications from product requirements, business flows, architecture documents, API contracts, database models, existing Next.js routes, feature modules, and shared UI components. Use when Codex needs to define a new page or workflow, document an existing screen, prepare a frontend implementation plan, align a screen with backend behavior, specify UI states and interactions, or review a screen specification for ambiguity and missing cases.
---

# Write Screen Spec

Create screen contracts precise enough for product review, UX decisions, frontend implementation, backend coordination, and acceptance testing without turning the frontend into the source of truth for business rules.

## Load references

- Read `references/screen-conventions.md` before creating or updating a specification.
- Read `references/domain-rules.md` for dashboard, product, transaction, queue, loan, inventory, authentication, user, role, snapshot, or status-change screens in KMG-SERVICE.
- Read `references/review-checklist.md` before reviewing or completing a specification.
- Start a new standalone specification from `assets/screen-spec-template.md`.

## Follow the workflow

1. Determine whether the request is new screen design, documentation of current behavior, an update, implementation planning, or review.
2. Inspect the repository instructions and relevant sources of truth before drafting. For KMG-SERVICE-WEB, read `AGENTS.md`, `../Context.md`, `../Business-Flow.md`, `../Frontend-Architecture.md`, `Frontend-Implement-Plan.md`, and `../Database-Design.md` when the screen touches a listed business domain. Inspect the owning route, feature, API wrapper, auth helper, app shell, shared UI, icons, and related tests. When implementation will use Next.js behavior, inspect the relevant guide under `node_modules/next/dist/docs/` and note deprecations.
3. Inspect the backend contract when available: OpenAPI documents, routes, schemas, response types, error codes, permissions, and status transitions. Separate confirmed behavior from proposals.
4. Resolve conflicts using this priority: explicit user requirement; approved business and architecture documents; published API contract; tested behavior; current implementation; inferred convention. Report conflicts that affect the screen.
5. Identify consequential unresolved decisions. Do not silently invent permissions, destructive actions, status transitions, inventory effects, financial calculations, pagination semantics, upload rules, or API behavior. Ask only when a missing decision materially changes the screen contract; otherwise make and report a conservative assumption.
6. Define the screen before writing detailed UI: purpose; users and permissions; route; entry and exit paths; jobs to be done; data dependencies; mutations; primary workflow; responsive strategy; server/client boundary.
7. Specify every observable state: initial loading, background refresh, success, empty, validation error, API error, partial data, unauthorized, forbidden, not found, offline or retry where relevant, and mutation pending/success/failure.
8. Map the composition to existing shared components and feature ownership. Name missing reusable primitives as proposals rather than embedding one-off equivalents in the page.
9. Define interactions, field rules, table behavior, dialogs, notifications, keyboard/focus behavior, accessibility labels, formatting, and acceptance criteria. Keep frontend validation assistive; identify backend-authoritative checks explicitly.
10. Write the specification using `assets/screen-spec-template.md`. Remove sections that are genuinely irrelevant and state `Not applicable` where omission could look accidental.
11. Validate the result against implementation sources and `references/review-checklist.md`.
12. Report the output path, confirmed facts, assumptions, open decisions, API gaps, implementation mismatches, and likely breaking changes.

## Enforce specification rules

- Describe observable user behavior, data needs, and ownership boundaries; avoid prescribing internal implementation without a repository-specific reason.
- Use Server Components by default for read-oriented screens and isolate Client Components to interactive regions that require browser state, events, effects, or client-only hooks.
- Keep page files focused on route composition and data boundaries. Place domain workflow UI under `src/features/<domain>` and reuse domain-neutral primitives from `src/components/ui`, icons from `src/components/icon`, and shell elements from `src/components/app-shell`.
- Never place access tokens in browser JavaScript or client-readable storage. Route authentication through the repository's server-side auth boundary.
- Treat backend authentication, authorization, validation, transaction validity, stock movement, queue ordering, loan state, pricing snapshots, and status transitions as authoritative.
- Distinguish required, optional, nullable, defaulted, derived, read-only, and conditionally visible fields.
- Specify source, refresh behavior, formatting, and fallback for every displayed datum that affects decisions.
- Define action visibility separately from backend permission enforcement.
- Preserve historical snapshot values when presenting past transactions.
- Use explicit Thai UI copy when wording affects implementation or acceptance; avoid vague placeholders such as “appropriate message”.
- Include realistic examples only when they clarify formatting, edge cases, or API mapping.
- Do not add features outside the requested domain merely to make the screen feel complete.

## Review specifications

Classify findings as:

- Blocker: unsafe, contradictory, impossible to implement reliably, or assigns backend-owned authority to the frontend.
- Major: missing workflow, API dependency, permission, critical state, acceptance criterion, or responsive behavior.
- Minor: ambiguous copy, weak example, naming inconsistency, accessibility gap, or maintainability concern.

Reference the section and affected screen or action for every finding. Lead with findings, then list assumptions and open questions. Do not modify implementation during a review unless explicitly asked.
