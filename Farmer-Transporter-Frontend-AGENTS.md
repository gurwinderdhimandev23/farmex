# AGENTS.md — Farmer & Transporter Frontend

## 1. Project Purpose

This repository contains the **frontend only** for the Farmer & Transporter Platform.

The backend APIs, database, authentication services, business rules, and server-side authorization already exist.

The frontend must consume the existing backend APIs.

Do not recreate backend functionality inside Next.js.

---

# 2. Core Architecture

This project follows:

- Next.js 15 App Router
- TypeScript
- Feature-Based Architecture
- Existing custom UI/components
- Existing backend API contracts

The routing layer and feature/business layer must remain separate.

### Main rule

`app` = routing only.

`features` = feature implementation, UI, API hooks/services, validation, types, utilities and feature logic.

Never mix routing with feature implementation.

---

# 3. app Directory Rules

The `app` directory is responsible ONLY for Next.js routing and route-level composition.

Allowed route files:

- page.tsx
- layout.tsx
- loading.tsx
- error.tsx
- template.tsx
- not-found.tsx
- route.ts
- global styles

Do not put business logic inside `page.tsx` or `layout.tsx`.

A route page should stay small and normally only import and render the relevant feature page.

Example:

```tsx
import { FarmerDashboardPage } from "@/features/farmer/pages/FarmerDashboardPage";

export default function Page() {
    return <FarmerDashboardPage />;
}
```

Keep route pages under 30 lines whenever reasonably possible.

Never place route files inside `features`.

Bad:

```text
features/
  farmer/
    page.tsx
```

Good:

```text
app/
  farmer/
    page.tsx
```

---

# 4. Recommended Folder Structure

Use Feature-Based Architecture.

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   │
│   │   ├── farmer/
│   │   │   ├── page.tsx
│   │   │   ├── enquiries/
│   │   │   ├── trips/
│   │   │   ├── mandi-prices/
│   │   │   └── profile/
│   │   │
│   │   ├── transporter/
│   │   │   ├── page.tsx
│   │   │   ├── requests/
│   │   │   ├── trips/
│   │   │   ├── return-loads/
│   │   │   └── profile/
│   │   │
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── farmers/
│   │       ├── transporters/
│   │       ├── vehicles/
│   │       ├── enquiries/
│   │       ├── pricing/
│   │       ├── labour/
│   │       ├── mandi-prices/
│   │       ├── trips/
│   │       ├── payments/
│   │       ├── notifications/
│   │       ├── reports/
│   │       └── system-status/
│   │
│   ├── globals.css
│   └── layout.tsx
│
├── features/
│   ├── auth/
│   ├── farmer/
│   ├── transporter/
│   ├── admin/
│   ├── enquiries/
│   ├── trips/
│   ├── payments/
│   ├── mandi-prices/
│   ├── labour/
│   ├── notifications/
│   └── users/
│
├── components/
│   ├── ui/
│   ├── common/
│   ├── layout/
│   ├── forms/
│   ├── dialogs/
│   ├── tables/
│   └── charts/
│
├── hooks/
├── services/
├── store/
├── lib/
├── config/
├── constants/
├── types/
└── assets/
```

The exact folders may be adjusted to match the existing repository, but the feature-based separation must remain.

---

# 5. Feature Rules

Every major feature should be self-contained.

A feature may contain:

```text
feature/
├── pages/
├── components/
├── hooks/
├── services/
├── schemas/
├── types/
├── utils/
├── constants/
└── store/
```

Use only the folders actually required by the feature.

A feature owns:

- Feature UI
- Feature hooks
- API integration
- Types
- Validation
- Utilities
- Constants
- Feature state when required

Do not create unnecessary files.

Do not duplicate the same business/UI logic across features.

---

# 6. Cross-Feature Access

Do not directly access another feature's internal implementation.

If something must be reused across features:

- move genuinely shared UI to `components`
- move genuinely shared utility to `lib`
- move genuinely shared type to `types`
- expose feature functionality through a public API such as `index.ts`

Feature-specific components must remain inside the feature.

---

# 7. Shared Components

Reusable UI components belong in:

```text
components/
```

Examples:

- Button
- Input
- Modal
- Drawer
- Table
- Card
- Badge
- Avatar
- Pagination
- Date picker
- Select
- Dropdown
- Confirmation dialog
- Empty state
- Loading state

Use the project's existing custom UI system.

## Important

**Do NOT introduce shadcn/ui.**

Do not replace the existing component system with shadcn.

Do not add shadcn dependencies merely for convenience.

Reuse and extend the existing project's UI components and styling conventions.

Feature-specific components stay inside their feature.

---

# 8. Business Logic

Business logic must not exist inside:

- page.tsx
- layout.tsx

Business/feature logic belongs in:

- hooks
- API helpers
- services where needed
- utilities
- feature components

The frontend must not recreate backend business rules.

The backend remains authoritative.

---

# 9. Backend API Integration

The backend already exists.

The frontend must consume the existing API contract.

Do not invent:

- API endpoints
- request fields
- response fields
- status values
- permission rules
- pricing rules

Follow the existing OpenAPI/Swagger/API contract exactly when available.

Use exact response properties instead of defensive fallback chains when the API contract defines them.

Example:

```tsx
res.data.accessToken
```

Do not silently change it into multiple speculative alternatives such as:

```tsx
res.data?.accessToken || res.data?.token || res.data?.data?.token
```

unless the actual API contract explicitly supports those shapes.

---

# 10. API Helpers

Reuse the existing API helpers in the project.

If the project already provides:

```text
getData
postData
putData
deleteData
```

use them.

Call API helpers directly from custom hooks/stores where that is the established project pattern.

Do not create redundant wrapper layers merely to wrap an existing helper.

Example:

```text
feature/
  hooks/
    useEnquiries.ts
```

The hook can call the existing API helper directly.

---

# 11. React Query / Server State

When React Query is already part of the project:

- keep API fetching inside feature hooks
- use query keys consistently
- invalidate affected queries after mutations
- avoid duplicate fetching
- keep server state separate from local UI state

Do not introduce another server-state library without a strong reason.

---

# 12. useEffect Rules

Keep `useEffect` simple.

Do not use `useEffect` for logic that can be derived directly during rendering.

For API fetching, prefer the project's existing query/hook architecture.

If an effect is required, define reusable fetch/handler functions outside the effect when that matches the project convention.

Avoid effects that cause unnecessary request loops.

---

# 13. Performance Rules

Optimize components and hooks against unnecessary re-renders.

Use:

- `useMemo` for expensive/derived calculations
- `useCallback` for handler props when it provides a real benefit
- `React.memo` for suitable presentational child components

Do not blindly memoize everything.

Memoization should solve an actual re-render/performance issue.

---

# 14. Authentication

The frontend must use the existing backend authentication mechanism.

Do not create a second authentication system.

Rules:

- never expose passwords
- never log passwords
- never log access tokens
- never log refresh tokens
- never place sensitive tokens in URLs
- do not hard-code credentials
- do not expose secrets through `NEXT_PUBLIC_*`

Sensitive authentication tokens should use the existing secure authentication architecture.

Where the current project uses HttpOnly cookies and `react-secure-storage`, follow that established implementation and environment-variable configuration.

Do not invent a different token-storage mechanism without explicit instruction.

---

# 15. RBAC

This project has three business roles:

- `FARMER`
- `TRANSPORTER`
- `ADMIN`

Always verify role permissions when building:

- protected routes
- navigation items
- action buttons
- feature hooks
- mutation actions

Hiding a button is only a UI concern.

The backend remains the actual authorization boundary.

Never assume that because a button is hidden the operation is secure.

---

# 16. Farmer Frontend

The Farmer experience should support the backend capabilities for:

- Login/Register
- Profile
- Dashboard
- Mandi prices
- Create transport enquiry
- My enquiries
- Enquiry details
- Trip/status tracking
- Transporter details
- Payment details

The enquiry UI may contain the backend-defined fields:

- pickup location
- destination location
- material/agricultural product
- quantity/weight
- vehicle requirement
- pickup date
- preferred time
- labour required
- labour quantity/type
- additional notes

Do not invent extra business fields without an API requirement.

---

# 17. Transporter Frontend

The Transporter experience should support:

- Login/Register
- Profile
- Vehicle information
- Availability
- Dashboard
- Pickup requests
- Pickup request details
- Accept request
- Reject request
- Active trip
- Trip status updates
- Completed trips
- Return loads
- Payment/earnings summary

## Pricing rule

The Transporter must NOT have frontend controls for:

- changing transport price
- entering transport price
- changing labour price
- entering labour price

The Transporter only sees the Admin-approved pricing returned by the backend.

---

# 18. Admin Frontend

The Admin experience should support:

- Admin login
- Dashboard
- Farmers
- Transporters
- Vehicles
- Enquiries
- Enquiry details
- Transporter assignment
- Transport pricing
- Labour management
- Mandi price management
- Active trips
- Payments
- Notifications
- Reports
- System status

Admin screens should use the project's existing shared:

- tables
- filters
- search
- pagination
- dialogs
- forms
- status badges
- cards

---

# 19. Enquiry Status

Use the backend status values exactly.

Known status values:

```text
SUBMITTED
ADMIN_ACCEPTED
TRANSPORTER_ASSIGNED
TRANSPORTER_ACCEPTED
TRANSPORTER_REJECTED
PICKUP
IN_TRANSIT
ON_DESTINATION
DELIVERED
PAYMENT_COMPLETED
CANCELLED
```

Create a shared status presentation pattern instead of repeating status styling throughout the application.

Never invent a new status in frontend code.

Never allow arbitrary status changes from the UI.

After mutations, display the backend-confirmed state.

---

# 20. Forms

Use the project's existing form solution.

Do not introduce a new form library if the repository already has one.

Every important form should provide:

- proper labels
- validation
- field-level error messages where the existing design system supports them
- submit/loading state
- duplicate-submit prevention
- API error handling
- success feedback
- keyboard accessibility

Client validation improves UX but is never a security boundary.

---

# 21. API Error Handling

Follow the project's existing error handling convention.

API and application errors should be displayed using **Sonner Toast** when Sonner is already configured.

Use:

```tsx
toast.error(...)
```

for API/application errors.

Do not create new inline error-banner patterns if the existing project standard is Sonner Toast.

Do not show success toasts for successful GET/fetch operations.

Show toast notifications:

- on errors
- after successful POST/PUT/DELETE mutations when user feedback is useful

Do not spam users with unnecessary toasts.

Never expose:

- stack traces
- database errors
- SQL errors
- internal service details
- secrets
- tokens

---

# 22. Loading / Empty / Error States

Every API-driven screen must handle:

### Loading
Use the existing loading/skeleton UI.

### Empty
Explain that there is no data and provide a useful next action when applicable.

### Error
Use the project's standard error/toast mechanism.

### Mutation pending
Disable duplicate actions and show appropriate progress.

Never leave an API-driven screen blank without explanation.

---

# 23. No Mock Data

When an API is connected:

Never use hardcoded mock business values.

Do not write patterns such as:

```tsx
const totalCount = 12;
```

or:

```tsx
const category = "CRIME & JUSTICE";
```

Do not add fake fallback data just to make the UI look populated.

If the API returns no data, render the proper empty state.

---

# 24. Tables and Lists

Use existing table components.

For large API datasets:

- prefer backend pagination
- prefer backend filtering where supported
- prefer backend search where supported
- debounce search inputs where needed
- avoid downloading unnecessarily large datasets
- preserve stable sorting

Do not implement a fake frontend pagination layer for data that the backend already paginates.

---

# 25. Navigation

Navigation must respect role permissions.

Farmer navigation should contain Farmer functionality.

Transporter navigation should contain Transporter functionality.

Admin navigation should contain Admin functionality.

Do not display irrelevant management routes to Farmer or Transporter users.

Do not treat navigation visibility as authorization.

---

# 26. Security

Never:

- commit secrets
- hard-code tokens
- expose private API credentials
- log sensitive authentication data
- trust localStorage as an authorization boundary
- trust URL parameters
- trust hidden form fields
- use frontend role checks as the only security layer
- render unsanitized HTML
- use `dangerouslySetInnerHTML` without a documented trusted/sanitized source

Use React's normal escaping by default.

---

# 27. TypeScript

Use strict TypeScript.

Avoid:

```text
any
@ts-ignore
@ts-nocheck
```

unless there is a documented unavoidable reason.

Follow the actual backend API types.

Do not silently cast incompatible response data.

Prefer:

- explicit interfaces/types
- discriminated unions
- typed hooks
- typed API responses
- reusable domain types

---

# 28. Utilities

Reusable generic utilities such as:

- `getInitials`
- `formatRole`
- `formatDate`
- currency formatting
- common string helpers

should live in the project's shared utility location, such as:

```text
@/lib/utils.ts
```

Do not duplicate the same utility function across features.

Feature-specific utilities should stay inside their feature.

---

# 29. Comments

Use:

```tsx
// single-line comment
```

for single-line comments.

Use:

```tsx
/**
 * Multiline comment or JSDoc.
 */
```

for multiline comments/JSDoc.

Do not add comments that merely repeat obvious code.

Comments should explain non-obvious decisions.

---

# 30. UI and Design System

Do not introduce shadcn/ui.

Use the existing project's custom components and design language.

Maintain consistency in:

- spacing
- typography
- colors
- borders
- radius
- shadows
- buttons
- forms
- tables
- dialogs
- navigation

If a reusable component already exists, reuse it.

Do not create a second version of the same component.

---

# 31. Responsive Design

The frontend must work on:

- mobile
- tablet
- desktop

Farmer and Transporter screens should prioritize mobile usability.

Admin screens may prioritize desktop but must remain usable on smaller screens.

Avoid:

- horizontal overflow
- broken tables
- unusable dialogs
- clipped buttons
- inaccessible forms

---

# 32. Accessibility

Follow accessible UI practices:

- semantic HTML
- labels for form controls
- keyboard navigation
- visible focus states
- accessible dialogs
- meaningful button labels
- appropriate alt text
- correct button types

Do not use a `<div>` as a button when a `<button>` is appropriate.

---

# 33. Destructive Actions

Use confirmation UI for destructive or important actions such as:

- reject enquiry
- cancel trip
- deactivate farmer
- deactivate transporter
- delete/deactivate mandi price
- deactivate labour type

Do not make destructive actions accidentally executable.

Use clear action labels.

---

# 34. Environment Variables

Use environment variables for configuration.

Browser-exposed variables must use:

```text
NEXT_PUBLIC_*
```

Only expose values that are genuinely safe for the browser.

Never expose:

- database credentials
- private API secrets
- signing keys
- service-account credentials
- private tokens

Do not commit secret environment files.

---

# 35. Git Rules

Use focused commits.

Preferred:

```text
feat: add farmer enquiry page
fix: handle transporter request rejection
refactor: extract enquiry status component
test: add farmer enquiry flow
```

Avoid meaningless commit messages such as:

```text
update
changes
final
fix
new code
```

Never commit secrets or debug artifacts.

---

# 36. Testing

Prioritize tests for critical frontend flows:

1. Farmer login
2. Farmer creates enquiry
3. Farmer views enquiry
4. Admin views enquiry
5. Admin enters pricing
6. Admin assigns transporter
7. Transporter accepts/rejects request
8. Transporter updates trip status
9. Farmer sees updated status
10. Payment status is displayed

Also test:

- unauthorized routes
- forbidden role access
- validation failures
- API failures
- empty states
- loading states
- mutation failures

---

# 37. AI Coding Agent Rules

Whenever generating or modifying code:

1. Inspect the existing repository before creating new architecture.
2. Follow this AGENTS.md.
3. Follow the existing project's component and styling system.
4. Do not introduce shadcn/ui.
5. Keep routing inside `app`.
6. Keep feature implementation inside `features`.
7. Keep route pages small.
8. Reuse existing shared components.
9. Reuse existing API helpers.
10. Follow the exact backend/OpenAPI contract.
11. Never invent API endpoints.
12. Never invent API response fields.
13. Never invent business statuses.
14. Respect Farmer/Transporter/Admin permissions.
15. Never recreate backend business logic.
16. Never add hardcoded mock business data to API-connected screens.
17. Extract reusable logic into hooks/utilities.
18. Avoid duplicate code.
19. Keep changes focused.
20. Do not modify unrelated files.
21. Do not add dependencies without checking existing dependencies first.
22. Use Sonner Toast according to the project's established error/mutation convention.
23. Keep `useEffect` simple.
24. Optimize real re-render problems with `useMemo`, `useCallback`, and `React.memo` where appropriate.
25. Use secure authentication patterns already established by the project.
26. Do not run a full production build after every small change.
27. Do not run `tsc --noEmit` after every small change unless type verification is needed.
28. Before finishing a significant feature, run the relevant lint/type/test checks.
29. If the backend contract is unclear, do not guess; identify the ambiguity.
30. Preserve existing working behavior.

---

# 38. Definition of Done

A frontend feature is complete when:

- route is correctly placed under `app`
- feature implementation is under `features`
- existing UI system is reused
- no shadcn/ui is introduced
- existing backend API is integrated
- API types match the contract
- authentication/role behavior is respected
- loading state is handled
- empty state is handled
- errors are handled using project conventions
- mutation feedback is handled
- no mock business data remains
- responsive behavior is checked
- accessibility is considered
- unnecessary duplicate code is avoided
- relevant tests are added/updated
- relevant checks pass

---

# 39. Final Architecture Rule

Always follow this separation:

```text
app
  ↓
routing only

features
  ↓
feature pages + components + hooks + API integration + feature logic

components
  ↓
shared UI

lib / utils
  ↓
shared utilities

backend API
  ↓
authentication + authorization + business rules + database
```

The frontend must remain a clean client of the existing backend.

When there is a conflict:

1. Existing backend/API contract
2. Existing repository architecture
3. This AGENTS.md
4. New implementation convenience

Never change the backend contract from the frontend.
