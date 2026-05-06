---
title: 'Abren ERP UI — Frontend Architectural Manifesto'
description: 'A **domain-aware frontend** for a Financial Operating System — not a collection of CRUD forms. We strictly adhere to the **Modular Monolith Mirroring** principle: the frontend is structurally aligned '
tier: frontend
tags: [frontend, architecture]
---

# Abren ERP UI — Frontend Architectural Manifesto

> **Version:** 3.0
> **Last Updated:** May 2026
> **Status:** LOCKED ARCHITECTURE BASELINE — This document is the single authoritative reference for frontend architecture. Content from previously separate documents (module structure, alignment strategy, screen runtime) has been consolidated here. All subordinate documents must conform to this baseline.
> **Backend Companion:** [Backend Architecture](ARCHITECTURE.md)

---

## 1. Philosophical Foundation

### 1.1 What We Are Building

A **domain-aware frontend** for a Financial Operating System — not a collection of CRUD forms. We strictly adhere to the **Modular Monolith Mirroring** principle: the frontend is structurally aligned with the backend's bounded contexts, while the ERP UI itself is governed by a **screen runtime** rather than ad hoc route pages.

### 1.2 The Alignment Principle

The frontend is **domain-aware and backend-aligned**, not an exact mirror. The backend's DDD layers (Entity → Service → Repository → UoW) are too granular for a UI. We collapse them into a simpler, pragmatic structure while preserving the same module names, action names, and domain vocabulary.

| Backend Concept          | Frontend Analog       | Relationship                                    |
| ------------------------ | --------------------- | ----------------------------------------------- |
| Bounded Context (module) | Simple Flat Module    | **1:1 alignment** — Mirroring backend modules   |
| Shared Kernel            | `src/shared/` library | **1:1 alignment** — contracts & primitives      |
| Domain Entity            | Plain Reactive Type   | **Vue-native** — No classes to break reactivity |
| Value Object             | Immutable Class       | **Encapsulated Logic** (e.g. `Money`)           |
| Use Case                 | Composable            | **Lifecycle Aware** — e.g. `useLedgerAccounts`  |
| Anti-Corruption Layer    | Mapper + Adapter      | **The Shield** — Infrastructure isolation       |

### 1.3 Two Axes of Growth

The project is designed for **zero-rewrite scaling**, following the exact same principles as the backend's **Architecture First** journey. The frontend grows along two independent axes:

1. **Vertical (Architecture): Constant.** Every module is built with strict statelessness, domain-aligned boundaries, mapper isolation, and the full security model from the moment of implementation. No exceptions.
2. **Horizontal (Product Depth): Additive.** New features plug into the existing screen runtime, platform services, state, and API client capabilities without requiring structural rewrites of the core platform.

### 1.4 The "Gold Standard" Principle

The architecture guarantees that progressive depth is always additive, never corrective. The path forward is exclusively about expanding functional scope.

### 1.5 Symmetry, Not Parity (Architectural Philosophy) [STRATEGIC]

We follow the principle of **"Mirroring the Bounded Context, Adapting the Medium."** The frontend is structurally symmetric with the backend to ensure predictability, but it is not a blind, code-level replica.

- **Mirroring (Parity)**: Top-level sub-directories in `src/modules/` must exactly match the backend's module names (e.g., `finance/ledger`).
- **Symmetry (Patterns)**: We mirror the backend's _intent_ using Vue-idiomatic patterns. The backend's `facade.py` finds its symmetric counterpart in the frontend's **Action-Oriented Composables** (e.g., `usePayRequest`).
- **Integrity (Absolute)**: The **Mapper-as-Factory** and **Layer Isolation** rules are absolute on both sides. The domain logic must be shielded from raw DTO shapes regardless of the language.

### 1.6 Full-Stack Symmetry: The DTO Contract

The backend's **OpenAPI Specification** is the authoritative contract for the full stack.

- The frontend generates its TypeScript types directly from this spec.
- The **Mapper-as-Factory** (§5) is the specific architectural component responsible for transforming these external DTO shapes into high-integrity Frontend Domain Models.

---

## 2. Core Architectural Principles

### 2.1 The Five Golden Rules

| Rule                      | Enforcement                                 | Prevents                     |
| ------------------------- | ------------------------------------------- | ---------------------------- |
| **Domain is Pure**        | No UI/API/State in `domain/`                | Business rule leakage        |
| **Infra is the Firewall** | Mandatory Mappers in `infrastructure/`      | Backend DTO leakage          |
| **App is Orchestration**  | Side effects ONLY in `application/`         | Logic scattered in UI        |
| **UI is Presentation**    | Screens render metadata, not business logic | Presentation coupling        |
| **Modular Monolith**      | Flat module separation                      | Engineering/Business overlap |

### 2.2 Strict Dependency Flow & Boundaries

Dependencies point **inward** only. Modules may only depend on `shared/` and never on each other.

```mermaid
graph TD
    subgraph Presentation
        P[Screen Renderers / Views]
    end

    subgraph Composition
        C[Composables - Use Cases]
    end

    subgraph Integration
        A[API Clients]
        M[Mappers - ACL]
    end

    subgraph "Shared Kernel"
        SK_T[Types & Interfaces]
        SK_C[Design System - shared/ui + platform contracts]
        SK_U[Utilities]
        SK_EB[Event Bus]
    end

    P --> C
    P --> SK_C
    C --> A
    C --> SK_EB
    A --> M
    M --> SK_T

    style Presentation fill:#1a472a,stroke:#2d6a4f,color:#fff
    style "Shared Kernel" fill:#1b3a4b,stroke:#3d5a80,color:#fff
    style Integration fill:#3d2b1f,stroke:#6b4226,color:#fff
```

#### ESLint Boundary Configuration

We strictly enforce our 4 layers via `eslint-plugin-boundaries` in `eslint.config.mjs`:

```javascript
'boundaries/element-types': [
  'error',
  {
    default: 'disallow',
    rules: [
      { from: 'domain', allow: ['shared', 'domain'] },
      { from: 'application', allow: ['shared', 'domain', 'application'] },
      { from: 'infrastructure', allow: ['shared', 'domain', 'infrastructure'] },
      { from: 'ui', allow: ['shared', 'domain', 'application', 'ui'] },
    ],
  },
]
```

We also strictly forbid cross-module imports natively using relative blockers:

```javascript
'no-restricted-imports': [
  'error',
  { patterns: [{ group: ['../*/**', '../../*/**', '../*/../*/**'] }] }
]
```

### 2.3 Layer Responsibilities

| Layer              | Responsibility              | Contains                                                                      | May Import           | Authority          |
| ------------------ | --------------------------- | ----------------------------------------------------------------------------- | -------------------- | ------------------ |
| **Domain**         | Pure business rules & types | `*.types.ts`, `Money.ts`                                                      | Nothing              | Business Logic     |
| **Application**    | Orchestration & Use Cases   | `application/useXxx.ts`, `application/query-keys.ts`                          | Domain, Infra        | **TanStack Query** |
| **Infrastructure** | ACL, Mapping, Adapters      | `infrastructure/adapter.ts`                                                   | Domain, Core API     | **DTOs** (input)   |
| **UI**             | Presentation & Rendering    | `ui/{ScreenID}/` (screen.ts, controller.ts, fields.ts, commands.ts, view.vue) | Application, Core UI | Presentation       |

### 2.4 Component Sizing and Separation of Concerns

Vue Single-File Components (SFCs) must not become dumping grounds for multiple layout regions, complex dialogs, and heavy orchestration. The architecture explicitly bans the **SFC God-Component** anti-pattern.

- **Size Limits**: An SFC should ideally remain under 200 lines. If a component exceeds 300-400 lines, it is almost certainly doing too much.
- **Separation of Concerns**: A page component should act as an orchestrator, not an implementer.
- **Extraction Triggers**: Extract the following into dedicated child components:
  - Floating action bars and their associated confirmation dialogs (e.g., `BulkActionBar.vue`).
  - Complex side panes (e.g., `FilterPane.vue`, `TracePane.vue`).
  - Domain-heavy data grids that require extensive custom cell formatting.
- **State Delegation**: The parent page holds the core data (`requests`, `selectedIds`) and passes them down as props, listening for events (`@approve`, `@reject`) from extracted children.

---

## 3. Technology Stack

### 3.1 Core Stack

| Layer                     | Technology                                                                                                        | Rationale                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Framework**             | Vue 3 (Composition API)                                                                                           | SFC colocation, perfect mapping for backend Use Cases                                                    |
| **Build**                 | Vite                                                                                                              | Sub-second HMR, native ESM, Tailwind v4 native support                                                   |
| **UI System**             | **Custom ERP Design System** (`shared/ui/` with compatibility exports from `shared/components/` during migration) | Full ownership, zero vendor lock-in, ERP-optimized. _(See [COMPONENT_SYSTEM.md](./COMPONENT_SYSTEM.md))_ |
| **Accessible Primitives** | **Headless primitives (Reka UI lineage)**                                                                         | Accessibility and behavior infrastructure owned through Abren wrappers, not vendor visual language       |
| **DataGrid Engine**       | **TanStack Table** + **TanStack Virtual**                                                                         | Sorting, filtering, pagination, virtualized scrolling                                                    |
| **Server State**          | **TanStack Query**                                                                                                | Caching, background refetch, optimistic updates. Authority for all domain data                           |
| **Form State**            | **TanStack Form** + **Zod**                                                                                       | Headless, type-safe validation                                                                           |
| **Client State**          | Pinia                                                                                                             | Ephemeral/UI state ONLY (sidebar collapse, local filters)                                                |
| **Styling**               | **Tailwind CSS v4**                                                                                               | `@theme` design tokens, utility-first CSS. _(See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md))_                |
| **Language**              | TypeScript (strict)                                                                                               | Compile-time safety, `noUncheckedIndexedAccess`                                                          |
| **HTTP**                  | Axios                                                                                                             | Interceptors for auth, idempotency, error envelopes                                                      |

### 3.2 Development & Quality

| Tool                   | Purpose                                                       |
| ---------------------- | ------------------------------------------------------------- |
| **ESLint**             | Code quality and global `no-console: error` enforcement       |
| **vp check** (Custom)  | High-integrity "Voluntary Purity" check for module boundaries |
| **Vitest**             | Unit and integration testing (Vite-native)                    |
| **openapi-typescript** | Auto-generate TS types from backend OpenAPI spec              |

### 3.3 Naming Conventions

All naming rules are governed by the authoritative **[Naming Standard](./NAMING.md)**. The standard covers folder names, file names, Vue component names, TypeScript identifiers, and the closed role vocabulary for components.

Key rules at a glance:

| Category                       | Rule                                     | Example                               |
| ------------------------------ | ---------------------------------------- | ------------------------------------- |
| Vue components (modules)       | `{Entity}{Role}.vue` — entity-first      | `AccountCreateDrawer.vue`             |
| Vue components (design system) | `App*` prefix                            | `AppButton.vue`, `AppSidePane.vue`    |
| DataGrid platform              | `DataGrid*` prefix                       | `DataGrid.vue`, `DataGridToolbar.vue` |
| TS files                       | `kebab-case`, dot-qualified              | `account.types.ts`, `ap.adapter.ts`   |
| Query keys                     | `query-keys.ts`                          | (one per module)                      |
| Composables                    | `use{Entity}[Action].ts`                 | `useCreatePaymentRequest.ts`          |
| Module root                    | `workspace.ts`, `screens.ts`, `index.ts` | —                                     |

> See [NAMING.md](./NAMING.md) for the full standard, prohibited patterns, and backlog of inconsistencies to fix.

---

## 4. Refined DRY Patterns (Alignment Standards)

### 4.1 Shared DataGrid Cells

To maintain consistency and reduce boilerplate in `*.grid.ts` definitions, we use specialized cell components:

- `MoneyCell`: Standardizes monetary display with currency alignment.
- `DateCell`: Uniform date formatting via `BusinessDate`.
- `BadgeCell`: Map domain statuses to design system variants in one place.

### 4.2 Resource Query Composables

Use cases that simply fetch a list of domain objects should use the `useResourceQuery` higher-order composable. This centralizes caching logic, error handling, and transformation (mapping).

### 4.3 Mapper-as-Factory Standard

Mappers should inherit from a `BaseMapper` (where applicable) or use shared mapping utilities to handle common transformations like `Money` objects and `BusinessDate` strings consistently across all modules.

---

## 5. Module Architecture

### 5.1 What Is a Module?

A **module** is a self-contained directory under `src/modules/` that represents one backend bounded context. Each backend module has a 1:1 frontend counterpart:

| Module      | Sub-Path         | Description                     |
| ----------- | ---------------- | ------------------------------- |
| `core`      | `core`           | Identity, Tenants, RBAC         |
| `workflows` | `workflows`      | State Machine, Engine           |
| `ledger`    | `finance/ledger` | Chart of Accounts, G/L          |
| `bank`      | `finance/bank`   | Cash Management, Reconciliation |
| `ap`        | `finance/ap`     | Accounts Payable, Payments      |
| `reporting` | `reporting`      | Cross-domain analytics          |

Modules are partitioned into two architectural categories:

| Category     | Role                                                  | Key Constraint                                              |
| :----------- | :---------------------------------------------------- | :---------------------------------------------------------- |
| **Platform** | The **"Engine"**. Provides cross-domain capabilities. | **Capability-First**. No business-specific logic allowed.   |
| **Business** | The **"Domain"**. Implements specific ERP features.   | **Domain-First**. Consumes platform features via Protocols. |

### 5.2 Module Internal Structure (Locked)

```
src/modules/{domain-group}/{module-name}/
├── domain/          # PURE: Interfaces, Value Objects, Logic
│   └── {entity}.types.ts
├── application/     # ORCHESTRATION: Use Case Composables (flat, no sub-folders)
│   ├── query-keys.ts
│   ├── use{Entity}.ts
│   ├── useCreate{Entity}.ts
│   ├── useApprove{Entity}.ts
│   └── ...
├── infrastructure/  # FIREWALL: Mappers, Adapters, Zod Schemas (ACL)
│   ├── {module}_adapter.ts
│   ├── api.schemas.ts
│   ├── api.types.ts
│   └── mappers.ts
├── ui/              # PRESENTATION: Screen folders keyed by Screen ID
│   ├── {ScreenID}/          # e.g. AP301000, AP3010PL
│   │   ├── screen.ts        # ScreenDefinition contract
│   │   ├── controller.ts    # Screen controller (PXGraph equivalent)
│   │   ├── fields.ts        # FieldDefinition declarations
│   │   ├── commands.ts      # Workflow action definitions
│   │   ├── view.vue         # Pure presentation template
│   │   ├── grids/           # Grid column definitions
│   │   └── sidepanels/      # Side panel components
│   └── {ScreenID}/          # Additional screens
├── screens.ts       # Module screen exports (imports from ui/{ScreenID}/screen.ts)
├── routes.ts        # Vue Router bindings
└── index.ts         # ModuleDefinition export
```

> **Structural Rules (Locked):**
>
> - `application/` is **flat** — no `composables/` sub-folder. Composable files live directly in `application/`.
> - `ui/` is **flat** — no `transactions/`, `profiles/`, or `inquiries/` sub-folders. Screen IDs self-categorize by their numbering convention (1xx=setup, 2xx=profile, 3xx=transaction, 4xx=inquiry, 5xx=processing, 6xx=report).
> - Each screen folder is named by its **Screen ID** (e.g., `AP301000`). Paired screens (Focus + Workspace) are siblings: `AP301000/` and `AP3010PL/`.
> - The `ui/` directory MUST ONLY contain Screen ID folders. Any cross-module UI concepts (e.g. `TraceabilityBadge`) must live in the UI Kernel at `src/shared/ui/`.

### 5.3 Module Registration Pattern

Each module exports a `ModuleDefinition` in its `index.ts`. The app consumes registered screens and workspace entries first; routes are transitional compatibility adapters while the screen runtime rollout is in progress.

```typescript
// modules/finance/ledger/index.ts
export const ledgerModule: ModuleDefinition = {
  id: 'ledger',
  name: 'General Ledger',
  category: 'business',
  screens,
  workspaceEntries,
  permissions: ['ledger.view', 'ledger.edit'],
}
```

### 5.4 Module Rules

1. **No cross-module imports**: `finance/ledger/` must NEVER import from `finance/ap/`.
2. **Public API**: If Module A needs data from Module B, it goes through the Event Bus or a Core type.
3. **Query-First State**: Domain data stays in TanStack Query. Pinia is for UI-specific toggles.
4. **Screen ownership**: Each module exports registered screens and workspace entries. Direct route ownership is transitional only.
5. **Composable Orchestration**: All business logic and API orchestration MUST live in Composables, keeping `.vue` files as thin view-only layers.
6. **Unbreakable DRY**: Domain UI patterns (like specialized selects or status badges) must be extracted and reused, never duplicated.
7. **UI Component Kernel**: Components rendered across multiple modules MUST be published to `src/shared/ui/` to prevent cross-module UI coupling.
8. **Stateless Workflow**: The frontend treats workflows as a cross-cutting action dispatcher. The UI NEVER orchestrates domain state transitions; it only projects backend state via the `ScreenStatePolicy`.

### 5.5 5-Component Scaffolding Checklist

When creating a new module or a major new aggregate root (e.g., `procurement`):

- [ ] 1. **Domain Types**: Define `domain/{entity}.types.ts` (Include **Branded IDs** for all identifiers).
- [ ] 2. **Zod Validation**: Define `infrastructure/schemas.ts` for all incoming API objects.
- [ ] 3. **Infrastructure Adapter**: Define `infrastructure/{module}_adapter.ts` (Parses **DTOs** using Zod schemas).
- [ ] 4. **Mapper-as-Factory**: Implement `toViewModel()` and `toDTO()` factory logic.
- [ ] 5. **Application Facade**: Create `application/use{Entity}.ts` and `application/query-keys.ts` using TanStack Query.
- [ ] 6. **UI Screens**: Build `ui/{ScreenID}/` folders with the standard controller/fields/view set.
- [ ] 7. **Quality Gate**: Run `vp check` to ensure zero boundary/console violations.
- [ ] 8. **Registration**: Export `screens` and `workspaceEntries`, then register the module in `src/modules/index.ts`.

---

## 6. The Mapper-as-Factory Pattern (Anti-Corruption Layer)

### 6.1 Why Mapper-as-Factory?

The backend evolves independently. **DTOs** (Data Transfer Objects) are the raw, volatile shapes from the server. The Mapper-as-Factory ensures:

1.  **Isolation**: Backend field renames only propagate to the mapper file, not to components or stores.
2.  **Integrity**: DTOs (raw data) are "sanitized" and transformed into high-integrity **Domain Models** or **ViewModels** (encapsulated logic).
3.  **Predictability**: Every component receives the same predictable data shape regardless of API versioning.

### 6.2 The Contract

Every module infrastructure layer must implement mappers with two standardized factory functions:

- `toViewModel()` / `toDomain()`: Transforms a raw backend DTO into a frontend-owned model.
- `toDTO()`: Transforms a frontend model back into the raw backend shape for mutations.

```typescript
// modules/ap/infrastructure/mappers.ts

import type { VendorBillDTO } from '../infrastructure/api.types'
import type { VendorBill, VendorBillId } from '../domain/vendor-bill.types'
import { Money } from '@/shared/domain/money'
import { toId } from '@/shared/types/brand.types'

/**
 * Mapper-as-Factory for AP.
 * Ensures the UI is never coupled to the backend's raw response shape.
 */
export class APMapper {
  static toVendorBill(dto: VendorBillDTO): VendorBill {
    return {
      // Branded Type enforcement in Mappers
      // This prevents accidental cross-assignment of identifiers
      id: toId<VendorBillId>(dto.id),
      beneficiary: dto.beneficiary_name,
      amount: Money.from(dto.amount, dto.currency),
      status: dto.status,
    }
  }
}
```

### 6.3 Nominal Identifier Isolation (Branded Types) [MANDATORY]

To prevent accidental cross-assignment of identifiers (e.g. passing a `UserId` to a function expecting a `TenantId`), we enforce **Nominal Typing** using Branded Types.

- **Rule**: Every UUID or Primary Key must be wrapped in a Branded Type: `type UserId = Brand<string, 'UserId'>`.
- **Enforcement**: Use the `toId<T>(val)` helper in Mappers. Never use raw `string` for entity identifiers in Domain or Application layers.

### 6.4 Rules

- **Absolute Shielding**: Components **NEVER** consume raw API DTOs. They receive `ViewModels` or `Domain Models` from the Mapper Factory.
- **Pure Logic**: Mappers are **pure functions** — no side effects, no API calls, no store access.
- **Test Mandatory**: Mappers have **100% unit test coverage**.

### 6.5 Fail-Fast Boundary (Zod Shielding) [MANDATORY]

To prevent malformed or unexpected backend data from contaminating the reactive state and causing silent UI failures, we enforce **Runtime Schema Validation** at the outermost edge of the infrastructure layer.

- **The Rule**: Every response from an internal API must be parsed by a Zod schema before being passed to a Mapper.
- **Location**: Zod schemas live in `src/modules/{module}/infrastructure/schemas.ts`.
- **Implementation**: The `adapter.ts` is responsible for calling `Schema.parse(rawData)`.
- **Why**: This ensures that structural mismatches between the Backend DTO and the Domain's expectations are caught immediately at the network boundary with a clear stack trace, rather than as cryptic "cannot read property of undefined" errors in deep UI components.

### 6.6 The DTO Type Preservation Protocol [FULL-STACK]

To maintain endpoint stability and avoid serializing complex objects over the wire, we preserve standard primitives at the API boundary:

- **The Contract**: Every `date` field in a backend DTO is serialized as a standard ISO-8601 string (`YYYY-MM-DD`).
- **Frontend Boundary**: The `Adapter` and `api.types.ts` use the `IsoDate` branded string.
- **The Mapper Rule**: The **Infrastructure Mapper** (§6) is responsible for converting these `IsoDate` strings into semantically specific **Branded Types** (like `ValueDate`, `TransactionDate`) upon entry into the Module Domain. No business logic should ever touch a raw, unbranded string.

### 6.7 Nominal (Branded) Temporal Types [MANDATORY]

Within the Shared Kernel (`shared/types/brand.types.ts`) and Module Domains, we use **Nominal Typing** to prevent "Domestic/Foreign" temporal slips.

- **`IsoDate`**: The base brand for any validated `YYYY-MM-DD` string.
- **`ValueDate`**: A brand representing a semantically significant financial date (valuation, posting, effective).
- **Rule**: You cannot pass a `PostingDate` where a `ValueDate` is required without explicit casting. This prevents logic errors in multi-currency Revaluation and Interest Calculation routines.

---

## 7. Cross-Module Communication

### 7.1 The Event Bus

Modules communicate via a typed Event Bus in `core/`. This mirrors the backend's domain event system.

```typescript
// core/event-bus/event-bus.ts
type EventMap = {
  'payment-request:submitted': { id: string }
  'payment-request:paid': { id: string; amount: Money }
  'journal-entry:posted': { id: string; entryNumber: string }
  'tenant:feature-toggled': { feature: string; enabled: boolean }
}
```

### 7.2 When to Use What

| Scenario                   | Mechanism         | Example                             |
| -------------------------- | ----------------- | ----------------------------------- |
| Parent → Child data        | Props             | `<UserTable :users="users" />`      |
| Child → Parent action      | Emits             | `emit('select', user)`              |
| Module → Module reactivity | Event Bus         | Payment paid → Refresh journal list |
| Global cross-cutting state | Core Store (Auth) | `useAuthStore().currentUser`        |

### 7.3 Data Flow Between Modules

To maintain full-stack integrity, all cross-module side effects travel via the **Event Bus**, while internal data flow is shielded by the **Mapper-as-Factory**.

```text
Module A (Finance/AP)               Module B (Finance/Ledger)
┌───────────────────────────┐         ┌───────────────────────────┐
│ [Application Composable]  │         │ [Application Composable]  │
│ usePayRequest()           │         │ useJournalEntries()       │
│  ├── adapter.pay()        │         │  ├── adapter.list()       │
│  └── mapper.toDTO()       │         │  └── mapper.toViewModel() │
│      └── [Side Effect]    │         │      └── [Domain Model]   │
│          eventBus.emit()  ├──┐      │                           │
│          'ap:pr:paid'     │  │      │ eventBus.on('ap:pr:paid') │
│          'ap:pr:paid'     │  │      │  └── query.invalidate()   │
└───────────────────────────┘  │      └───────────────────────────┘
                               │                  ▲
                               └──────────────────┘
                            Event Bus (Shared Kernel)
```

---

### 7.4 Anti-Pattern: Direct Imports

```typescript
// ❌ BANNED: Module A importing Module B's internals
import { useLedgerStore } from '@/modules/finance/ledger/stores/ledger.store'

// ✅ CORRECT: Listen via Event Bus
eventBus.on('ledger:entry-posted', ({ id }) => {
  // React to the event within our own module
  refreshRelatedData(id)
})
```

---

## 8. Core Infrastructure (`src/shared/`)

### 8.1 What Goes in Core

| Directory      | Contents                                                                     | Rule                                      |
| -------------- | ---------------------------------------------------------------------------- | ----------------------------------------- |
| `api/`         | HTTP client, response types, error handler                                   | Infrastructure only                       |
| `auth/`        | Auth store, route guard, token types                                         | Cross-cutting identity concern            |
| `composables/` | `useApiQuery`, `useApiMutation`, `useFeatureGate`                            | Cross-cutting utilities                   |
| `domain/`      | `Money` VO, `Currency` enum, branded types                                   | Mirrors backend Shared Kernel             |
| `event-bus/`   | Typed event bus                                                              | Module communication contract             |
| `types/`       | screen/runtime identifiers, module contracts, cross-cutting types            | Shared contracts                          |
| `ui/`          | **Custom ERP Design System** (primitives, ERP components, screen components) | Module-agnostic UI                        |
| `utils/`       | Consolidated Pure utility functions (Barrel exported)                        | `import { format } from '@/shared/utils'` |

### 8.2 What Does NOT Go in Core

- Business logic specific to any module
- Components that are only used by one module
- Module-specific types or interfaces
- Module API clients (these belong in each module's `api/` directory)

### 8.3 Utility Consolidation Rule

All module-agnostic utility functions (Date, Number, String helpers) must be registered in the **Barrel Export** at `src/shared/utils/index.ts`. Modules must import from the barrel to ensure a single, audited utility surface.

---

## 9. API Design Standards (Frontend Perspective)

### 9.1 Consuming Action-Oriented Endpoints

The backend exposes action-oriented endpoints (`POST /{id}/submit`, `POST /{id}/approve`). The frontend mirrors this with action-specific composables:

```
Backend Endpoint                     → Frontend Composable
POST /payment-requests               → useCreateRequest()
POST /payment-requests/{id}/submit   → useSubmitRequest()
POST /payment-requests/{id}/approve  → useApproveRequest()
POST /payment-requests/{id}/reject   → useRejectRequest()
POST /payment-requests/{id}/pay      → usePayRequest()
```

### 9.2 Response Envelope Handling

All backend responses follow the envelope `{ success, data, meta }` or `{ success, detail, code }`. The core HTTP client handles this via **two mechanisms**:

1. **Response Interceptor:** Catches errors (401 → session teardown, structured errors → extract `detail`).
2. **Typed Helper Functions:** Unwrap the `data` field from the success envelope.

```typescript
// core/api/http-client.ts — Typed helpers that unwrap the envelope
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await httpClient.get<ApiResponse<T>>(url, config)
  return response.data.data // Extracts { success, data, meta } → T
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await httpClient.post<ApiResponse<T>>(url, body, config)
  return response.data.data
}
// apiPut, apiPatch, apiDelete follow the same pattern.
```

Module adapters import these helpers exclusively — never raw `httpClient`:

```typescript
// modules/finance/ledger/infrastructure/ledger_adapter.ts
import { apiGet } from '@/shared/api/http-client'

export const ledgerAdapter = {
  async getAccounts(): Promise<Account[]> {
    const dtos = await apiGet<AccountRead[]>('/finance/ledger/accounts')
    return dtos.map(mapAccount)
  },
}
```

### 9.3 Idempotency Key Integration

All mutating requests (`POST`, `PUT`, `PATCH`) automatically attach an `Idempotency-Key` header via the core HTTP client interceptor.

### 9.4 Strict API Error Typing

Our shared wrappers `useApiQuery` and `useApiMutation` must enforce `TError = ApiError`. This maps directly to the backend's structured error envelope `{ success: false, detail: string, code: string }`, eliminating `any` casting and ensuring typo-free error handling in the UI.

### 9.5 Query Key Factory Pattern (TanStack Query)

To avoid silent failures during cache invalidation caused by hardcoded String arrays (e.g. `['payment-requests']`), every module MUST define a single source of truth for its query keys in the application layer.

```typescript
// src/modules/{module}/application/query-keys.ts
export const moduleKeys = {
  all: ['module'] as const,
  lists: () => [...moduleKeys.all, 'lists'] as const,
  detail: (id: string) => [...moduleKeys.all, id] as const,
}
```

All Use Case Composables must consume this factory instead of hardcoded strings.

---

## 10. Hybrid Authorization Model (UI Perspective)

### 10.1 Feature Gates (Tenant-Level)

Feature gates control whether a **tenant** has access to an entire module or capability. These are configured per-tenant in the backend and surfaced via `TenantInfo.features`.

```typescript
// core/composables/useFeatureGate.ts
const { isEnabled, guardRoute } = useFeatureGate('webhooks')

// In templates:
<MenuItem v-if="isEnabled" label="Webhooks" />

// In route guards:
beforeEnter: () => guardRoute() // Redirects to feature-disabled page
```

**Use for:** Module visibility, premium feature gating, tenant plan restrictions.

### 10.2 RBAC Permissions (User-Level)

Permissions control whether a **user** can perform a specific action within an enabled module. Each `ModuleDefinition` declares its required permissions, and the auth store provides a `hasPermission()` helper.

```typescript
// core/auth/auth.store.ts
function hasPermission(permission: string): boolean {
  return currentUser.value?.permissions?.includes(permission) ?? false
}

// In templates:
<Button v-if="authStore.hasPermission('ledger.edit')" @click="openEditor">
  Edit Account
</Button>
```

**Use for:** Button visibility, action authorization, menu item filtering.

### 10.3 ABAC (Data Sovereignty)

The UI is strictly **stateless and tenant-scoped**. It relies on the backend to filter resources based on attribute ownership (tenant ID, department, data scope). The UI's responsibility is to:

1. Provide the **Tenant Context** via the `Authorization` header (JWT contains tenant claims).
2. Enable "Edit" modes only when the user's attributes match the record's metadata.
3. **Never** implement row-level filtering on the frontend — this is the backend's responsibility.

---

## 11. Anti-Pattern Catalog (Banned List)

| Anti-Pattern                         | Why It Fails                            | Alternative                                |
| ------------------------------------ | --------------------------------------- | ------------------------------------------ |
| **Raw API types in components**      | Backend DTO change breaks 50 components | Mapper → ViewModel pattern                 |
| **Cross-module store imports**       | Creates invisible dependency graphs     | Event Bus or Core types                    |
| **Business logic in templates**      | Untestable, duplicated across views     | Composables (Use Case Hooks)               |
| **Global CSS classes**               | Styling conflicts across modules        | Scoped styles + design tokens              |
| **`any` types**                      | Defeats TypeScript's entire purpose     | Strict mode, branded types                 |
| **Direct Axios calls in components** | Untestable, no error interception       | Module-scoped API client                   |
| **Storing tokens in localStorage**   | XSS vulnerability                       | httpOnly cookies or in-memory              |
| **Inline styles for theming**        | Unmaintainable at scale                 | Tailwind v4 `@theme` design tokens         |
| **Raw HTML tables**                  | No sorting, pagination, virtual scroll  | shared ERP `DataGrid` platform             |
| **Bypassing design system**          | UI inconsistency                        | Always use shared ERP/screen components    |
| **`console.log`**                    | Leaks debug data, litters production    | Use high-level error boundaries or logging |
| **SFC God-Component**                | Page files >400 lines, unmaintainable   | Extract action bars, panes, and dialogs    |

---

## 12. Related Documentation

| Document                                         | Description                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| [Acumatica Alignment](ACUMATICA_ALIGNMENT.md)    | **Rosetta Stone** — maps all Acumatica UI concepts to Abren equivalents |
| [UX Architecture Manifesto](UX_ARCHITECTURE.md)  | The interactive behavior and workflow OS standards                      |
| [Identifier Strategy](IDENTIFIER_STRATEGY.md)    | Mapping Human IDs to Backend UUIDs across the stack                     |
| [Screen Runtime](SCREEN_RUNTIME.md)              | Unified screen runtime, toolbar rendering, side panel                   |
| [Screen Migration](SCREEN_MIGRATION.md)          | Step-by-step legacy → Screen ID conversion guide                        |
| [Component System](COMPONENT_SYSTEM.md)          | Ownership, contracts, and build status markers                          |
| [State Management](STATE_MANAGEMENT.md)          | TanStack Query (server) + Pinia (ephemeral UI) state                    |
| [API Integration](API_INTEGRATION.md)            | HTTP client, adapter, mapper, composable pipeline                       |
| [Form Architecture](FORM_ARCHITECTURE.md)        | TanStack Form + Zod integration and form patterns                       |
| [Field System](../FIELD_SYSTEM.md)               | Field rendering authority                                               |
| [Error Handling](ERROR_HANDLING.md)              | Error categories, toast system, loading states                          |
| [Testing Strategy](TESTING_STRATEGY.md)          | Frontend testing pyramid and coverage targets                           |
| [Naming Conventions](NAMING.md)                  | File, component, and entity naming standards                            |
| [Design System](DESIGN_SYSTEM.md)                | Visual pillars, density, and brand tokens                               |
| [Development Guide](../DEVELOPMENT.md)           | Local setup, coding standards, and conventions                          |
| [Repository Strategy](../REPOSITORY_STRATEGY.md) | How the UI repo coexists with the API repo                              |

## 13. Quality & Documentation Standards

### 13.1 In-Code Documentation Philosophy

Comments must answer questions the code cannot. The _what_ is in the code — comments explain the _why_, the _tradeoff_, or the _constraint_ that led to a decision.

**Write a comment when:**

- The logic is non-obvious or involves an edge case.
- A business rule drives a technical choice.
- A workaround exists for a library bug or limitation.
- A complex algorithm or reactive dependency chain is implemented.

### 13.2 TSDoc Standards

- **Module-Level**: Required for `core/` and non-trivial entries. State responsibility and constraints.
- **Composable**: Required for all exported composables. Include an `@example` block. Omit raw `{type}` markers as TypeScript is the authoritative Source of Truth (SOT).
- **Vue Component**: Required in `<script setup>` for all components outside `shared/ui/` and compatibility `shared/components/`. Describe purpose and data sourcing.

### 13.3 Type Annotations

Mandatory everywhere. `any` is strictly banned — use `unknown` with type guards.

---

_This document is the locked authoritative baseline for frontend architecture. Version 3.0 reflects the architecture lock-in decision of May 2026. All subordinate documents must conform to this baseline._
