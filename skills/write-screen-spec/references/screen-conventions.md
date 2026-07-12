# Screen specification conventions

## Sources and scope

- Identify one owning route and one owning feature for each screen.
- Mark statements as `Confirmed`, `Proposed`, or `Assumption` when sources disagree or behavior does not exist yet.
- Link or name the requirement, API operation, source file, or design artifact supporting consequential behavior.
- Keep a screen spec focused on observable behavior and implementation boundaries, not backend internals.

## Required screen definition

Define:

1. Screen name and route.
2. Purpose and user outcome.
3. Allowed roles and both UI visibility and backend enforcement expectations.
4. Entry points, exit paths, and navigation context.
5. Read data, mutation data, API operations, cache or refresh behavior, and ownership.
6. Desktop and mobile composition.
7. Server Component and Client Component boundaries.
8. Existing shared components and any proposed shared primitive.
9. UI states, interactions, accessibility behavior, and acceptance criteria.

## Data mapping

For each meaningful datum, specify:

- UI label and format.
- API field or confirmed source.
- Required, optional, nullable, or derived status.
- Fallback when absent.
- Whether it is current master data or historical snapshot data.
- Whether users can edit it and which backend operation persists it.

Do not infer an endpoint merely because a screen needs data. Record missing operations as API gaps.

## State model

Cover states independently when relevant:

- Initial loading and route-level loading.
- Background refresh or stale data.
- Populated success and empty success.
- Partial or unavailable secondary data.
- Field validation and form-level validation.
- Mutation pending, duplicate submission prevention, success, and failure.
- Unauthorized, forbidden, and not found.
- Recoverable API failure and retry.
- Disabled, inactive, completed, or cancelled records.

Name the visible copy and available actions for important states.

## Interaction contract

For every action, define:

- Trigger and location.
- Visibility and enabled conditions.
- Confirmation requirements.
- Request mapping.
- Pending behavior and duplicate-action protection.
- Success result, navigation, refresh, toast, or inline feedback.
- Failure behavior, retained user input, and retry path.
- Focus destination and keyboard behavior for dialogs or dynamic content.

## Responsive and accessibility contract

- Define how dense tables transform on narrow screens: horizontal scroll, priority columns, stacked rows, or a dedicated compact view.
- Preserve primary actions without covering content or forcing ambiguous icon-only controls.
- Require programmatic labels, visible focus, logical tab order, semantic headings, announced errors, and accessible dialog focus management.
- Do not use color as the only status indicator.
- Specify Thai labels where text length affects layout.

## Acceptance criteria

- Write observable Given/When/Then statements or equally testable conditions.
- Include happy path, empty state, at least one meaningful failure, permission behavior, and mobile behavior.
- Keep criteria independent from unstable implementation details such as hook names or DOM nesting.
