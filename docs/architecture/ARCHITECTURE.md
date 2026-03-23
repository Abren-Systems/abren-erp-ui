# Abren ERP UI — Frontend Architectural Manifesto

> **Version:** 1.0
> **Last Updated:** March 2026
> **Status:** AUTHORITATIVE — This document is the single source of truth for all architectural decisions in the Abren ERP UI.
> **Backend Companion:** [Backend Architecture](../../../abren-erp-api/docs/architecture/ARCHITECTURE.md)

---

## 1. Philosophical Foundation

### 1.1 What We Are Building

A **domain-aware frontend** for a Financial Operating System — not a collection of CRUD forms. We strictly adhere to the **Modular Monolith Mirroring** principle: the frontend is structurally aligned with the backend's bounded contexts, ensuring that business logic boundaries are preserved from the database all the way to the UI.

### 1.2 The Alignment Principle

The frontend is **domain-aware and backend-aligned**, not an exact mirror. The backend's DDD layers (Entity → Service → Repository → UoW) are too granular for a UI. We collapse them into a simpler, pragmatic structure while preserving the same module names, action names, and domain vocabulary.

| Backend Concept          | Frontend Analog     | Relationship                                    |
| ------------------------ | ------------------- | ----------------------------------------------- |
| Bounded Context (module) | Hierarchical Module | **Bifurcated** — Business vs Platform           |
| Shared Kernel            | `src/core/` library | **1:1 alignment** — contracts & primitives      |
| Domain Entity            | Plain Reactive Type | **Vue-native** — No classes to break reactivity |
| Value Object             | Immutable Class     | **Encapsulated Logic** (e.g. `Money`)           |
| Use Case                 | Composable          | **Lifecycle Aware** — e.g. `useLedgerAccounts`  |
| Anti-Corruption Layer    | Mapper + Adapter    | **The Shield** — Infrastructure isolation       |

### 1.3 Evolution Path

The project is designed for **zero-rewrite scaling**. Today's module boundaries are tomorrow's micro-frontend packages. The architecture supports:

```
Phase 1 (Now):     Vue 3 SPA with Module Directories
Phase 2 (Growth):  Nx/Turborepo Mono-repo with per-module packages
Phase 3 (Scale):   Module Federation micro-frontends
```

---

## 2. Core Architectural Principles

### 2.1 The Five Golden Rules

| Rule                      | Enforcement                            | Prevents                     |
| ------------------------- | -------------------------------------- | ---------------------------- |
| **Domain is Pure**        | No UI/API/State in `domain/`           | Business rule leakage        |
| **Infra is the Firewall** | Mandatory Mappers in `infrastructure/` | Backend DTO leakage          |
| **App is Orchestration**  | Side effects ONLY in `application/`    | Logic scattered in UI        |
| **UI is Presentation**    | Pages use formatters, not domain logic | Presentation coupling        |
| **Bifurcated Mono-Repo**  | Business vs Platform separation        | Engineering/Business overlap |

### 2.2 Strict Dependency Flow

Dependencies point **inward** only. Modules may only depend on `core/` and never on each other.

```mermaid
graph TD
    subgraph Presentation
        P[Pages / Views]
    end

    subgraph Composition
        C[Composables - Use Cases]
    end

    subgraph State
        S[Pinia Stores]
    end

    subgraph Integration
        A[API Clients]
        M[Mappers - ACL]
    end

    subgraph "Core Infrastructure"
        SK_T[Types & Interfaces]
        SK_C[Design System - core/ui]
        SK_U[Utilities]
        SK_EB[Event Bus]
    end

    P --> C
    P --> SK_C
    C --> S
    C --> A
    C --> SK_EB
    A --> M
    M --> SK_T

    style Presentation fill:#1a472a,stroke:#2d6a4f,color:#fff
    style "Shared Kernel" fill:#1b3a4b,stroke:#3d5a80,color:#fff
    style Integration fill:#3d2b1f,stroke:#6b4226,color:#fff
```

### 2.3 Layer Responsibilities

| Layer              | Responsibility              | Contains                    | May Import           | Authority          |
| ------------------ | --------------------------- | --------------------------- | -------------------- | ------------------ |
| **Domain**         | Pure business rules & types | `*.types.ts`, `Money.ts`    | Nothing              | Business Logic     |
| **Application**    | Orchestration & Use Cases   | `application/composables/`  | Domain, Infra        | **TanStack Query** |
| **Infrastructure** | ACL, Mapping, Adapters      | `infrastructure/adapter.ts` | Domain, Core API     | **DTOs** (input)   |
| **UI**             | Presentation & Formatting   | `ui/pages/`, `ui/utils/`    | Application, Core UI | Presentation       |

---

## 3. Technology Stack

### 3.1 Core Stack

| Layer                     | Technology                                | Rationale                                                                                                            |
| ------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Framework**             | Vue 3 (Composition API)                   | SFC colocation, perfect mapping for backend Use Cases                                                                |
| **Build**                 | Vite                                      | Sub-second HMR, native ESM, Tailwind v4 native support                                                               |
| **UI System**             | **Custom Design System** (`core/ui/`)     | Full ownership, zero vendor lock-in, ERP-optimized. _(See [UI_FOUNDATION_DECISION.md](./UI_FOUNDATION_DECISION.md))_ |
| **Accessible Primitives** | **Reka UI** / **shadcn-vue**              | Headless Dialog, Tooltip, Popover, DropdownMenu                                                                      |
| **DataGrid Engine**       | **TanStack Table** + **TanStack Virtual** | Sorting, filtering, pagination, virtualized scrolling                                                                |
| **Server State**          | **TanStack Query**                        | Caching, background refetch, optimistic updates                                                                      |
| **Form State**            | **TanStack Form** + **Zod**               | Headless, type-safe validation                                                                                       |
| **Client State**          | Pinia                                     | Ephemeral/UI state ONLY (sidebar collapse, local filters)                                                            |
| **Server State**          | **TanStack Query**                        | Authority for all domain data (ledger accounts, etc.)                                                                |
| **Styling**               | **Tailwind CSS v4**                       | `@theme` design tokens, utility-first CSS. _(See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md))_                            |
| **Language**              | TypeScript (strict)                       | Compile-time safety, `noUncheckedIndexedAccess`                                                                      |
| **HTTP**                  | Axios                                     | Interceptors for auth, idempotency, error envelopes                                                                  |

### 3.2 Development & Quality

| Tool                          | Purpose                                          |
| ----------------------------- | ------------------------------------------------ |
| **ESLint**                    | Code quality and import boundary enforcement     |
| **Vitest**                    | Unit and integration testing (Vite-native)       |
| **Vue Test Utils**            | Component testing                                |
| **Playwright**                | End-to-end testing                               |
| **MSW** (Mock Service Worker) | API mocking for integration tests                |
| **openapi-typescript**        | Auto-generate TS types from backend OpenAPI spec |

---

## 4. Module Architecture

### 4.1 What Is a Module?

A **module** is a self-contained directory under `src/modules/` that represents one backend bounded context. It owns its:

- **Pages** (route-level views)
- **Components** (reusable within the module)
- **Store** (Pinia client state)
- **API client** (HTTP calls to its backend counterpart)
- **Mappers** (DTO → ViewModel transformation)
- **Types** (TypeScript interfaces)
- **Routes** (lazy-loaded route definitions)
- **Registration** (`index.ts` — `ModuleDefinition` export)

### 4.2 Module Internal Structure (Mandatory)

```
src/modules/{category}/{module-name}/
├── infrastructure/  # FIREWALL: Mappers, Adapters (ACL)
├── domain/          # PURE: Interfaces, Value Objects, Logic
├── application/     # ORCHESTRATION: Use Case Composables
└── ui/              # PRESENTATION: Components, Pages, Formatters
    ├── components/
    ├── pages/
    └── utils/       # UI-specific formatters
```

### 4.3 Module Registration Pattern

Each module exports a `ModuleDefinition` in its `index.ts`. The router aggregates these dynamically:

```typescript
// modules/business/finance/ledger/index.ts
export const ledgerModule: ModuleDefinition = {
  id: 'ledger',
  name: 'General Ledger',
  category: 'business',
  routes: () => import('./routes').then((m) => m.default),
  permissions: ['ledger.view', 'ledger.edit'],
  menuItems: [
    { label: 'Chart of Accounts', route: 'LedgerCoa', icon: 'book-open' },
    { label: 'Journal Entries', route: 'LedgerJournals', icon: 'file-text' },
  ],
}
```

### 4.4 Module Rules

1. **No cross-module imports**: `business/finance/ledger/` must NEVER import from `business/finance/ap/`.
2. **Public API**: If Module A needs data from Module B, it goes through the Event Bus or a Core type.
3. **Query-First State**: Domain data stays in TanStack Query. Pinia is for UI-specific toggles.
4. **Route ownership**: Each module exports a `ModuleDefinition`.

---

## 5. Anti-Corruption Layer (The Mapper Pattern)

- **Component Foundation**: [Reka UI](https://reka-ui.com/) (formerly Radix Vue) + [shadcn-vue](https://www.shadcn-vue.com/). We use headless primitives to ensure 100% accessibility and full styling control via our custom design system.

### 5.1 Why Mappers?

The backend will evolve independently. **DTOs** (Data Transfer Objects) are the raw shapes from the server. Mappers ensure:

1. Backend field renames only propagate to the mapper file, not to 50+ components.
2. DTOs are "sanitized" into high-integrity domain types.

### 5.2 The Contract

```typescript
// modules/payment-requests/infrastructure/payment-request.mapper.ts

import type { PaymentRequestDTO } from '../infrastructure/api.types'
import type { PaymentRequestViewModel } from '../ui/types/view.types'

export function toViewModel(dto: PaymentRequestDTO): PaymentRequestViewModel {
  return {
    id: dto.id,
    beneficiary: dto.beneficiary_name,
    amount: Money.from(dto.amount, dto.currency),
    status: dto.status,
    statusLabel: STATUS_LABELS[dto.status], // UI-specific
    statusColor: STATUS_COLORS[dto.status], // UI-specific
    canSubmit: dto.status === 'DRAFT', // UI invariant
    canApprove: dto.status === 'SUBMITTED', // UI invariant
    submittedAt: dto.submitted_at ? formatDate(dto.submitted_at) : null,
  }
}
```

### 5.3 Rules

- Components **NEVER** consume raw API DTOs. They receive `ViewModels` from the mapper.
- Mappers are **pure functions** — no side effects, no API calls, no store access.
- Mappers have **100% unit test coverage**. They are the cheapest and most critical tests.
- When the backend changes a DTO field, **only the mapper file changes** — components remain untouched.

---

## 6. Cross-Module Communication

### 6.1 The Event Bus

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

### 6.2 When to Use What

| Scenario                   | Mechanism         | Example                             |
| -------------------------- | ----------------- | ----------------------------------- |
| Parent → Child data        | Props             | `<UserTable :users="users" />`      |
| Child → Parent action      | Emits             | `emit('select', user)`              |
| Module → Module reactivity | Event Bus         | Payment paid → Refresh journal list |
| Global cross-cutting state | Core Store (Auth) | `useAuthStore().currentUser`        |

### 6.3 Anti-Pattern: Direct Imports

```typescript
// ❌ BANNED: Module A importing Module B's internals
import { useLedgerStore } from '@/modules/business/finance/ledger/stores/ledger.store'

// ✅ CORRECT: Listen via Event Bus
eventBus.on('ledger:entry-posted', ({ id }) => {
  // React to the event within our own module
  refreshRelatedData(id)
})
```

---

## 7. Core Infrastructure (`src/core/`)

### 7.1 What Goes in Core

| Directory      | Contents                                                    | Rule                           |
| -------------- | ----------------------------------------------------------- | ------------------------------ |
| `api/`         | HTTP client, response types, error handler                  | Infrastructure only            |
| `auth/`        | Auth store, route guard, token types                        | Cross-cutting identity concern |
| `composables/` | `useApiQuery`, `useApiMutation`, `useFeatureGate`           | Cross-cutting utilities        |
| `domain/`      | `Money` VO, `Currency` enum, branded types                  | Mirrors backend Shared Kernel  |
| `event-bus/`   | Typed event bus                                             | Module communication contract  |
| `types/`       | `ModuleDefinition`, cross-cutting types                     | Shared contracts               |
| `ui/`          | **Custom Design System** (components, patterns, primitives) | Module-agnostic UI             |
| `utils/`       | Date formatters, number formatters                          | Pure utility functions         |

### 7.2 What Does NOT Go in Core

- Business logic specific to any module
- Components that are only used by one module
- Module-specific types or interfaces
- Module API clients (these belong in each module's `api/` directory)

---

## 8. API Design Standards (Frontend Perspective)

### 8.1 Consuming Action-Oriented Endpoints

The backend exposes action-oriented endpoints (`POST /{id}/submit`, `POST /{id}/approve`). The frontend mirrors this with action-specific composables:

```
Backend Endpoint                     → Frontend Composable
POST /payment-requests               → useCreateRequest()
POST /payment-requests/{id}/submit   → useSubmitRequest()
POST /payment-requests/{id}/approve  → useApproveRequest()
POST /payment-requests/{id}/reject   → useRejectRequest()
POST /payment-requests/{id}/pay      → usePayRequest()
```

### 8.2 Response Envelope Handling

All backend responses follow the envelope `{ success, data, meta }` or `{ success, detail, code }`. The core HTTP client unwraps these automatically:

```typescript
// core/api/http-client.ts
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await axios(config)
  if (response.data.success) {
    return response.data.data as T
  }
  throw new ApiError(response.data.detail, response.data.code)
}
```

### 8.3 Idempotency Key Integration

All mutating requests (`POST`, `PUT`, `PATCH`) automatically attach an `Idempotency-Key` header via the core HTTP client interceptor.

---

## 9. Anti-Pattern Catalog (Banned List)

| Anti-Pattern                         | Why It Fails                            | Alternative                         |
| ------------------------------------ | --------------------------------------- | ----------------------------------- |
| **Raw API types in components**      | Backend DTO change breaks 50 components | Mapper → ViewModel pattern          |
| **Cross-module store imports**       | Creates invisible dependency graphs     | Event Bus or Core types             |
| **Business logic in templates**      | Untestable, duplicated across views     | Composables (Use Case Hooks)        |
| **Global CSS classes**               | Styling conflicts across modules        | Scoped styles + design tokens       |
| **`any` types**                      | Defeats TypeScript's entire purpose     | Strict mode, branded types          |
| **Direct Axios calls in components** | Untestable, no error interception       | Module-scoped API client            |
| **Storing tokens in localStorage**   | XSS vulnerability                       | httpOnly cookies or in-memory       |
| **Inline styles for theming**        | Unmaintainable at scale                 | Tailwind v4 `@theme` design tokens  |
| **Raw HTML tables**                  | No sorting, pagination, virtual scroll  | `core/ui` DataGrid (TanStack Table) |
| **Bypassing design system**          | UI inconsistency                        | Always use `core/ui` components     |

---

## 10. Related Documentation

| Document                                         | Description                                           |
| ------------------------------------------------ | ----------------------------------------------------- |
| [Module Structure](MODULE_STRUCTURE.md)          | Detailed module boundaries and folder conventions     |
| [State Management](STATE_MANAGEMENT.md)          | Pinia store patterns and reactive state flows         |
| [API Integration](API_INTEGRATION.md)            | HTTP client, mapper patterns, OpenAPI type generation |
| [Testing Strategy](TESTING_STRATEGY.md)          | Frontend testing pyramid and coverage targets         |
| [Development Guide](../DEVELOPMENT.md)           | Local setup, coding standards, and conventions        |
| [Repository Strategy](../REPOSITORY_STRATEGY.md) | How the UI repo coexists with the API repo            |

---

_This document is the authoritative reference for all frontend architectural decisions. Every pull request is reviewed against these principles._
