# Module Structure & Boundary Rules

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)

---

## 1. Bounded Context → Module Mapping

Each backend module has a 1:1 frontend counterpart:

| Module      | Sub-Path         | Description                     |
| ----------- | ---------------- | ------------------------------- |
| `core`      | `core`           | Identity, Tenants, RBAC         |
| `workflows` | `workflows`      | State Machine, Engine           |
| `ledger`    | `finance/ledger` | Chart of Accounts, G/L          |
| `bank`      | `finance/bank`   | Cash Management, Reconciliation |
| `ap`        | `finance/ap`     | Accounts Payable, Payments      |
| `reporting` | `reporting`      | Cross-domain analytics          |

---

### 1.1 Architectural Categorization

To maintain a scalable and clean workspace, modules are partitioned into two architectural categories:

| Category     | Role                                                  | Key Constraint                                              |
| :----------- | :---------------------------------------------------- | :---------------------------------------------------------- |
| **Platform** | The **"Engine"**. Provides cross-domain capabilities. | **Capability-First**. No business-specific logic allowed.   |
| **Business** | The **"Domain"**. Implements specific ERP features.   | **Domain-First**. Consumes platform features via Protocols. |

### 1.2 The Single-Module Boundary Rule (Consolidation)

**Rule:** Every backend module (Bounded Context) maps to exactly **one** frontend module.

To prevent "Sub-Module Fatigue," do **NOT** create deep layer nesting for related features. For example, `Payment Requests` and `Vendor Bills` are both features of the `AP` (Accounts Payable) module and MUST live within the same decoupled 4-layer taxonomy:

- ❌ `finance/ap/payment-requests/infrastructure/`
- ✅ `finance/ap/infrastructure/` (Shared adapter for all AP context)

**UI Organization:** Within the `ui/` layer of complex modules, you **MUST** slice the presentation layer into **Aggregate Roots** to prevent component soup.
For example, `ui/payment-requests/pages/` and `ui/vendor-bills/pages/`.

---

## 2. Module Internal Structure

Every module **MUST** adhere to the **4-Layer Taxonomy** to ensure horizontal scalability and prevent business logic leakage into the presentation layer.

```text
src/modules/{module}/
├── domain/                  # [Pure] Business rules & Types
│   ├── {entity}.types.ts    # Frontend domain models
│   └── {vo}.ts              # Value Objects (logic-rich types like Money)
│
├── infrastructure/          # [Firewall] Anti-Corruption Layer (ACL)
│   ├── mappers.ts           # [MANDATORY] Mapper-as-Factory (DTO ↔ UI Model)
│   ├── {module}_adapter.ts  # [I/O] Typed API Communication
│   └── api.types.ts         # Backend DTO interfaces (Source: Backend OpenAPI)
│
├── application/             # [Orchestration] Use Case Composables (UI Facades)
│   └── composables/
│       ├── use{Entity}s.ts  # Query Facade (TanStack Query)
│       └── use{Action}.ts   # Command Facade (Mutations & Side-effects)
│
├── ui/                      # [Presentation] View-only layer
│   └── {aggregate_root}/    # Slice by feature for complex modules (e.g. `ui/accounts/`)
│       ├── components/      # Stateless molecules & module-specific atoms
│       ├── pages/           # Route-level stateful orchestrators
│       ├── grids/           # TanStack Table column configurations
│       └── utils/           # Display formatters
│
├── routes.ts                # Synchronous RouteRecordRaw definitions
└── index.ts                 # ModuleDefinition export
```

### 2.1 The UI Facade (Composables)

In our **Symmetry-over-Parity** model, the frontend's **Application Composables** are the symmetric counterpart to the backend's `facade.py`.

- **Rule**: Component files (`.vue`) are strictly prohibited from calling Mappers or Adapters directly.
- **Rule**: All API orchestration, caching configuration, and side-effect dispatching (toasts, event bus) must happen within a Composable.

---

## 3. Naming Conventions

### Files

| Type        | Pattern                 | Example                 |
| ----------- | ----------------------- | ----------------------- |
| List Page   | `*ListPage.vue`         | `AccountsListPage.vue`  |
| Detail Page | `*DetailPage.vue`       | `AccountDetailPage.vue` |
| Editor Page | `*EditPage.vue`         | `AccountEditPage.vue`   |
| Create Page | `*CreatePage.vue`       | `AccountCreatePage.vue` |
| Wizard Page | `*WizardPage.vue`       | `OnboardingWizard.vue`  |
| Form Drawer | `*FormDrawer.vue`       | `AccountFormDrawer.vue` |
| Adapter     | `{module}_adapter.ts`   | `ledger_adapter.ts`     |
| Mapper      | `{entity}.mapper.ts`    | `account.mapper.ts`     |
| Composable  | `use{Action}.ts`        | `useLedgerAccounts.ts`  |
| Types       | `{entity}.types.ts`     | `account.types.ts`      |
| Branded ID  | `{entity}Id` type       | `UserId`, `TenantId`    |
| Formatter   | `{entity}-formatter.ts` | `account-formatter.ts`  |
| Routes      | `routes.ts`             | —                       |
| Entry       | `index.ts`              | —                       |

### Data Types

- **DTOs**: Raw as-received-from-server types (from `generated.types.ts`).
- **Domain Types**: Clean, reactive frontend-owned interfaces.
- **Nominal IDs (Branded)**: Mandated for all primary keys (e.g. `UserId`) to prevent type-unsafe assignment.
- **View Models**: UI-specific derivations (colors, labels, permissions).

### Composable Naming (Action Alignment)

Composable names mirror the backend's action-oriented API endpoints:

```
Backend: POST /journal-entries/{id}/void  →  useVoidEntry()
Backend: POST /payment-requests/{id}/pay  →  usePayRequest()
Backend: POST /payment-requests/{id}/submit →  useSubmitRequest()
Backend: GET  /accounts                   →  useAccountList()
```

---

## 4. Boundary Rules

### 4.1 Import Rules (Enforced by ESLint)

```typescript
// ✅ ALLOWED: Module imports from core
import { Money } from '@/shared/domain/money'
import { httpClient } from '@/shared/api/http-client'

// ✅ ALLOWED: Module imports from itself
import { useLedgerAccounts } from '../application/composables/useLedgerAccounts'
import { mapAccount } from '../infrastructure/ledger.mapper'

// ❌ BANNED: Module imports from another module
import { usePaymentStore } from '@/modules/finance/ap/...'
```

### 4.2 ESLint Boundary Configuration

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

### 4.3 Data Flow Between Modules

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
└───────────────────────────┘  │      │  └── query.invalidate()   │
                               │      └───────────────────────────┘
                               │                  ▲
                               └──────────────────┘
                            Event Bus (Shared Kernel)
```

## 5. Route Registration Pattern

Each module exports a `ModuleDefinition` that includes its routes, permissions, and menu items:

```typescript
// modules/finance/ledger/index.ts
import type { ModuleDefinition } from '@/shared/types/module.types'
import routes from './routes'

export const ledgerModule: ModuleDefinition = {
  id: 'ledger',
  name: 'General Ledger',
  category: 'business',
  routes,
  permissions: ['ledger.view', 'ledger.edit'],
  menuItems: [{ label: 'Chart of Accounts', route: 'LedgerCoa', icon: 'book-open' }],
}
```

The central `app/router/index.ts` aggregates all module definitions dynamically:

```typescript
// app/router/index.ts
import { modules } from '@/modules'

const router = createRouter({
  routes: [
    {
      path: '/app',
      component: AuthenticatedLayout,
      beforeEnter: [requiresAuth],
      children: [], // Populated dynamically from module definitions
    },
  ],
})

// Register module routes dynamically
for (const mod of modules) {
  mod.routes().then((routes) => {
    routes.forEach((route) => router.addRoute('app', route))
  })
}
```

---

## 10. Frontend Architectural Symmetry (Vue 3 Mapper)

To maintain full-stack integrity, the frontend must mirror the backend's domain boundaries while adapting to the UI's reactive medium.

| Pattern            | Frontend Implementation                   | Backend Symmetric Counterpart                           |
| ------------------ | ----------------------------------------- | ------------------------------------------------------- |
| **Entry Point**    | **Action Composables** (`application/`)   | **Module Facade** (`application/facade.py`)             |
| **ACL (Firewall)** | **Mapper-as-Factory** (`infrastructure/`) | **Infrastructure Mapper** (`infrastructure/mappers.py`) |
| **Data Shape**     | **ViewModels / Models** (`domain/`)       | **DTOs** (`application/dtos.py` / `generated.types.ts`) |
| **State Caching**  | **TanStack Query** (Server State)         | **Read-Side Cache / Redis**                             |

---

## 5-Component Scaffolding Checklist

When creating a new module (e.g., `procurement`):

- [ ] 1. **Domain Types**: Define `domain/{entity}.types.ts` (Include **Branded IDs** for all identifiers).
- [ ] 2. **Infrastructure Adapter**: Define `infrastructure/{module}_adapter.ts` (Fetches **DTOs** using `apiGet/apiPost`).
- [ ] 3. **Mapper-as-Factory**: Implement `toViewModel()` and `toDTO()` factory logic (Include **Nominal ID** wrapping via `toId<T>`).
- [ ] 4. **Application Facade**: Create `application/composables/use{Entity}` using TanStack Query.
- [ ] 5. **UI Orchestration**: Build `ui/pages/` and `ui/components/` as view-only compositions.
- [ ] 6. **Quality Gate**: Run `vp check` and `npm run lint` to ensure zero boundary/console violations.
- [ ] 7. **Registration**: Export `ModuleDefinition` in `index.ts` and register in `src/modules/registry.ts`.
