---
title: 'Operational Contract Specification'
description: 'The platform constitution defining authority boundaries, state ownership, and synchronization rules between the backend, platform runtime, and UI rendering tiers.'
tier: architecture
tags: [frontend, backend, architecture, contract]
---

# Operational Contract Specification

> **Version:** 1.0
> **Status:** AUTHORITATIVE
> **Last Updated:** May 2026
> **Companion:** [Acumatica Alignment](ACUMATICA_ALIGNMENT.md) · [Frontend Architecture (Backend)](../../abren-api/docs/architecture/core-principles/FRONTEND_ARCHITECTURE.md)

---

## 1. Purpose

This document is the **platform constitution**. It defines the non-negotiable boundaries between the three architectural tiers of the Abren ERP system. Every piece of state, every mutation, every command, and every rendering decision must be traceable to a rule in this document.

Without this document, semantic drift between the backend and frontend is inevitable. With it, both codebases can evolve independently while maintaining operational coherence.

> [!CAUTION]
> **The Anti-Drift Rule:** The frontend must NEVER infer operational legality from status values. It renders what the backend declares. The moment frontend code contains `if (status === 'DRAFT')` to determine editability, the architecture has failed.

---

## 2. The Three-Tier Architecture

The Abren ERP is not a frontend and a backend. It is three distinct architectural tiers:

```
┌─────────────────────────────────────────────────────────┐
│                   Backend Authority                      │
│  Operational truth · Workflow legality · Validation      │
│  Security · OCC · Domain model · Business rules          │
├─────────────────────────────────────────────────────────┤
│                   Platform Runtime                       │
│  Projection resolution · Controller orchestration        │
│  State synchronization · Command dispatch                │
│  Field system · Navigation · Screen lifecycle            │
├─────────────────────────────────────────────────────────┤
│                   UI Rendering                           │
│  Screen identity · Rendering implementation              │
│  Interaction · Accessibility · Ephemeral UX state        │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Authority Ownership Table

Every operational decision must be owned by exactly one tier. Shared ownership is an architectural violation.

### 3.1 Backend Authority (Sole Owner)

| Decision                       | Examples                                                            | Rule                                                                         |
| ------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Workflow transitions**       | Which status transitions are legal                                  | Backend `WorkflowBlueprint` is sole source of truth                          |
| **Available actions**          | Which commands the current user can execute on the current record   | Backend sends `available_actions: list[str]` in every entity response        |
| **Field permissions**          | Which fields are editable/readonly/hidden per record state          | Backend sends `field_permissions: dict[str, FieldPermission]`                |
| **Validation (authoritative)** | Whether a mutation is accepted or rejected                          | Backend validates and returns errors; frontend may preview but never decides |
| **Security & permissions**     | Which users can access which records and actions                    | Backend enforces; frontend hides UI elements but never trusts itself         |
| **Business rules**             | Posting rules, balancing rules, tax calculations, period validation | Backend owns all business logic. Frontend may display results, never compute |
| **Concurrency control**        | Which version of a record is current                                | Backend maintains `version` field and rejects stale writes with `409`        |
| **Audit trail**                | Who did what, when, and why                                         | Backend records; frontend provides audit reasons when backend requires them  |
| **Domain model**               | Entity structure, relationships, invariants                         | Backend defines; frontend receives mapped representations                    |

### 3.2 Platform Runtime (Sole Owner)

| Decision                  | Examples                                                                  | Rule                                                                    |
| ------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Projection resolution** | Computing `ScreenProjection` from backend data + commands                 | `resolveScreenProjection()` is a pure function owned by `src/platform/` |
| **Command dispatch**      | Routing a command execution to the correct adapter call                   | Controller `registerCommand()` maps keys to handlers                    |
| **Field binding**         | Connecting a field definition to form state + projection overrides        | `useField()` reads projection, form state, and field definition         |
| **Screen lifecycle**      | INITIALIZING → VIEW → EDIT → SAVING state machine                         | `ScreenStateMachine.ui` owned by `useScreenController`                  |
| **Query caching**         | When to fetch, when to use cache, when to invalidate                      | TanStack Query with controller-defined `queryKey`                       |
| **Session management**    | OCC version tracking, stale detection, dirty graph, mutation coordination | Controller instance maintains session state                             |

### 3.3 UI Rendering (Sole Owner)

| Decision                    | Examples                                                  | Rule                                          |
| --------------------------- | --------------------------------------------------------- | --------------------------------------------- |
| **Visual rendering**        | How a selector looks, grid column widths, color schemes   | CSS, component templates, design tokens       |
| **Keyboard UX**             | Tab order, shortcuts, focus management                    | Component-level interaction handlers          |
| **Accessibility**           | ARIA attributes, screen reader support                    | Component responsibility                      |
| **Layout composition**      | Which sections appear in which order on which breakpoints | Screen `.vue` templates                       |
| **Ephemeral interactions**  | Dialog open/closed, expanded rows, active tab             | Local `ref()` state in components             |
| **Animation & transitions** | Hover effects, loading skeletons, micro-animations        | CSS transitions and Vue transition components |

---

## 4. Mutation Protocol

### 4.1 Action-Oriented Endpoints

Every write operation uses action-oriented endpoints. Generic `PATCH` is prohibited for business aggregates.

```
✅ POST /finance/ap/payment-requests/{id}/submit
✅ POST /finance/ap/payment-requests/{id}/approve
✅ POST /finance/ap/vendor-bills/{id}/validate

❌ PATCH /finance/ap/payment-requests/{id}  { status: "SUBMITTED" }
❌ PUT /finance/ap/payment-requests/{id}
```

### 4.2 Mutation Response Contract

Every mutation response returns the updated entity with operational metadata:

```python
class FieldPermission(str, Enum):
    EDITABLE = "editable"
    READONLY = "readonly"
    HIDDEN = "hidden"

# Every workflow-enabled entity response includes:
{
    "data": { ... },                              # The entity DTO
    "available_actions": ["approve", "reject"],    # What the user CAN do next
    "field_permissions": {                         # Strict FieldPermission enum values
        "vendor_id": "readonly",
        "amount": "readonly",
        "justification": "readonly"
    },
    "expected_next": "approve",                    # The green button (nullable)
    "version": 3                                   # OCC version
}
```

> [!WARNING]
> **`field_permissions` uses a strict `FieldPermission` enum.** Only three values are legal: `EDITABLE`, `READONLY`, `HIDDEN`. Any field not listed inherits the screen-level default. Presentation semantics (`highlight`, `tab`, `required`, `visible`) must NEVER appear in this contract. The backend says what is **permitted**. The frontend decides how to **render** it.

### 4.3 Concurrency Protocol

Every mutation on a versioned entity must include the OCC version:

```
POST /finance/ap/payment-requests/{id}/approve
If-Match: 3
```

If the version has changed since the frontend loaded the record:

```json
{
  "success": false,
  "error": {
    "code": "CONCURRENCY_ERROR",
    "message": "Record was modified by another user."
  }
}
```

The frontend must **never silently retry**. It must show a degraded UX state and prompt the user to refresh.

---

## 5. State Taxonomy

Every piece of state in the system must belong to exactly one of these six categories. Cross-category state is an architectural violation.

| Category               | Owner Tier        | Storage                       | Lifetime             | Examples                                                                                                                              |
| ---------------------- | ----------------- | ----------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Operational State**  | Backend Authority | PostgreSQL                    | Persistent           | `PaymentRequest.status`, `JournalEntry.posted`, workflow instance state                                                               |
| **Projection State**   | Platform Runtime  | `ScreenProjection` (computed) | Per-render cycle     | `commandProjections[]`, `fieldOverrides`, `expectedNextAction`, `banner`                                                              |
| **Cached Query State** | Platform Runtime  | TanStack Query cache          | Until invalidation   | Fetched entity data, list results, stats aggregates                                                                                   |
| **Form Edit State**    | Platform Runtime  | TanStack Form                 | Until save/discard   | Dirty field values, validation errors, touched state                                                                                  |
| **Session State**      | Platform Runtime  | Controller instance           | Until screen unmount | OCC version token, stale detection flag, command execution state, mutation coordination, refresh pending, conflict resolution context |
| **Ephemeral UI State** | UI Rendering      | `ref()` / `reactive()` locals | Until unmount        | Active tab index, dialog open/closed, expanded grid rows, filter panel visibility                                                     |

### 5.1 The Taxonomy Rule

> If you cannot place a piece of state into exactly one row of this table, the design is wrong.

Common violations:

- A `ref()` that tracks workflow status → **violation** (operational state stored as ephemeral UI state)
- A computed property that checks `if (status === 'DRAFT')` to determine editability → **violation** (operational inference in platform runtime)
- A Pinia store holding entity data → **violation** (cached query state belongs in TanStack Query, not Pinia)

---

## 6. Screen Session Model

The controller (`useScreenController`) is not just a composable — it is a **screen session**. A screen session encapsulates:

| Session Property       | Source                      | Category           | Purpose                          |
| ---------------------- | --------------------------- | ------------------ | -------------------------------- |
| Loaded entity snapshot | TanStack Query cache        | Cached Query State | The last-known server state      |
| OCC version            | Backend `version` field     | Session State      | Stale-write detection            |
| Dirty field graph      | TanStack Form               | Form Edit State    | Unsaved edits                    |
| Available commands     | Backend `available_actions` | Session State      | What the user can do right now   |
| Field capabilities     | Backend `field_permissions` | Session State      | Which fields are editable        |
| Projection             | `resolveScreenProjection()` | Projection State   | Deterministic rendering contract |
| Query context          | Route params + filter state | Session State      | What data feeds the session      |

### 6.1 Session Lifecycle

```
Screen Mount → INITIALIZING → (entity loaded) → VIEW
                                                  ↓
                                            (user edits) → EDIT
                                                  ↓
                                            (user saves) → SAVING → VIEW
                                                  ↓
                                            (409 conflict) → DEGRADED
```

The `DEGRADED` state is new. When backend `field_permissions` is absent or an OCC conflict occurs, the screen renders ALL fields readonly with a degraded UX banner:

> "Unable to determine field permissions. Read-only mode."
> "Record was modified by another user. Please refresh."

---

## 7. Synchronization Guarantees

### 7.1 What the Frontend Can Cache

| Data                                  | Cache Strategy                        | Invalidation                              |
| ------------------------------------- | ------------------------------------- | ----------------------------------------- |
| Entity data (detail view)             | TanStack Query with `staleTime: 0`    | On mutation success, on navigation return |
| List data                             | TanStack Query with `staleTime: 30s`  | On any mutation to the same entity type   |
| Reference data (currencies, accounts) | TanStack Query with `staleTime: 5min` | Manual invalidation only                  |
| User preferences                      | Pinia store (local)                   | On explicit user action                   |

### 7.2 What the Frontend Must Re-Fetch

| Trigger                                 | Action                                                    |
| --------------------------------------- | --------------------------------------------------------- |
| Mutation success                        | Invalidate entity query + list query for that entity type |
| Navigation to detail screen             | Always fetch fresh (staleTime: 0)                         |
| OCC conflict (409)                      | Invalidate and refetch the entity                         |
| Screen session resume (tab switch back) | Refetch if last fetch > 30s ago                           |

### 7.3 What the Frontend Must Never Cache

- `available_actions` independently of the entity — they are part of the entity response
- Workflow state separately from the entity — status is always read from the entity
- Security/permission data — always derived from the current response

---

## 8. Command Contract

### 8.1 Current Contract (Phase 1-4)

Backend sends `available_actions` as a list of command keys:

```json
"available_actions": ["approve", "reject", "cancel"]
```

Frontend `commands.ts` provides **presentation metadata only**:

```typescript
{
  key: 'approve',          // Matches backend available_actions key
  labelKey: 'Approve',     // Display label
  icon: 'check',           // Icon name
  variant: 'primary',      // Visual emphasis
  categoryKey: 'processing', // More Menu grouping
  displayOnMainToolbar: true,
}
```

The following properties are **prohibited** in `commands.ts` after Phase 2:

- `from[]` — backend decides visibility
- `to` — backend decides transitions

### 8.2 Evolution Target (Phase 5+)

Backend grows `available_actions` from `list[str]` to rich command descriptors:

```json
"available_actions": [
  {
    "key": "approve",
    "enabled": true,
    "requires_confirmation": true,
    "audit_reason_required": false,
    "destructive": false
  }
]
```

This allows the frontend to progressively drop behavioral metadata from `commands.ts` as the backend takes over.

---

## 9. Field Permissions Contract

### 9.1 The Three Permission Values

| Value      | Meaning                        | Frontend Behavior                    |
| ---------- | ------------------------------ | ------------------------------------ |
| `EDITABLE` | User may modify this field     | Render as interactive input          |
| `READONLY` | User may see but not modify    | Render as disabled/read-only display |
| `HIDDEN`   | User should not see this field | Do not render                        |

### 9.2 Inheritance Rule

Fields not listed in `field_permissions` inherit the **screen-level default**:

- If the entity response includes `field_permissions` → unlisted fields default to `EDITABLE`
- If the entity response does NOT include `field_permissions` → **fail closed**: ALL fields render as `READONLY` with degraded UX banner

### 9.3 Priority Resolution

When multiple sources provide field state, the priority is:

```
1. Backend field_permissions (highest — operational authority)
2. Screen-level default (from field_permissions presence/absence)
3. FieldDefinition static metadata (type, label — always applies)
```

`policy.ts` is **eliminated**. There is no frontend policy layer. The backend is the sole authority for field permissions.

---

## 10. The Frontend Module Structure

After Phase 2, each frontend module follows this structure:

```
modules/finance/ap/
├── models/              # Mapped type interfaces ONLY (no business predicates)
│   └── ap.types.ts      # PaymentRequest, VendorBill interfaces
├── application/         # Use-case orchestration (THICK layer)
│   ├── usePaymentRequest.ts       # Query composable
│   ├── usePaymentRequests.ts      # List query composable
│   ├── useSubmitPaymentRequest.ts # Command pipeline: confirm → execute → invalidate → notify
│   └── useOCCRecovery.ts          # 409 handling: prompt → refetch → reconcile
├── infrastructure/      # Network boundary, anti-corruption
│   ├── ap.adapter.ts    # API calls with Zod validation
│   ├── api.schemas.ts   # Zod schemas matching backend DTOs
│   ├── api.types.ts     # Raw API response types
│   └── mappers.ts       # DTO → domain model transformation
└── ui/                  # Screen identity + rendering
    └── AP301500/
        ├── screen.ts        # ScreenDefinition (identity, views, permissions)
        ├── commands.ts      # Presentation metadata only (key, label, icon, variant)
        ├── fields.ts        # FieldDefinitions (type, label, selector config)
        ├── controller.ts    # The Graph — session orchestration
        └── AP301500.vue     # Vue template — pure rendering
```

> [!IMPORTANT]
> **No `policy.ts`.** Field editability comes from `field_permissions` in the backend response. No `domain/` folder. Business predicates are prohibited on the frontend.

---

## 11. Verification & Enforcement

### 11.1 Automated Guards

| Guard                                              | What It Catches                        | Where                       |
| -------------------------------------------------- | -------------------------------------- | --------------------------- |
| `npm run check`                                    | Type errors, lint violations           | Frontend CI                 |
| Grep for `canTransitionTo\|isEditable\|isFinal`    | Business predicates on frontend        | Frontend CI (after Phase 2) |
| Grep for `status === ` in non-infrastructure files | Anti-drift rule violations             | Frontend CI (after Phase 2) |
| OpenAPI contract test for `available_actions`      | Missing operational metadata           | Backend CI (after Phase 1)  |
| `scripts/arch-guard.py`                            | Cross-module imports, layer violations | Backend CI                  |

### 11.2 Code Review Checklist

Before approving any PR, verify:

- [ ] No new `if (status === 'X')` logic added to frontend controllers or templates
- [ ] No new business predicates added to `models/` (formerly `domain/`)
- [ ] Mutations use action-oriented endpoints, not PATCH
- [ ] `commands.ts` has no `from[]` or `to` properties (after Phase 2)
- [ ] New state can be placed into exactly one taxonomy row
