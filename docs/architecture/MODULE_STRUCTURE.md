# Module Structure & Boundary Rules

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)

---

## 1. Bounded Context → Module Mapping

Each backend module has a 1:1 frontend counterpart:

| Module | Category | Sub-Path | Description |
|---|---|---|---|
| `core` | Platform | `platform/core` | Identity, Tenants, RBAC |
| `workflows` | Platform | `platform/workflows` | State Machine, Engine |
| `ledger` | Business | `business/finance/ledger` | Chart of Accounts, G/L |
| `bank` | Business | `business/finance/bank` | Cash Management, Reconciliation |
| `ap` | Business | `business/finance/ap` | Accounts Payable, Payments |
| `reporting` | Platform | `platform/reporting` | Cross-domain analytics |

---

## 2. Module Internal Structure

Every module **MUST** follow this exact directory layout:

```
src/modules/{category}/{module}/
├── domain/                  # [Pure] Business rules & Types
│   ├── {entity}.types.ts
│   └── {vo}.ts              # Value Objects (e.g. Money)
│
├── application/             # [Orchestration] Composables
│   └── use{Entity}List.ts   # Side-effect logic
│
├── infrastructure/          # [Firewall] ACL
│   ├── {module}.mapper.ts   # DTO Conversion
│   └── {module}.adapter.ts  # API Communication
│
└── ui/                      # [Presentation] SFCs & Display Logic
    ├── components/          # Tier 3 (Stateless)
    ├── pages/               # Tier 4 (Orchestrators)
    ├── grids/               # Grid Configurations
    └── utils/               # UI Logic (Formatters)
```

---

## 3. Naming Conventions

### Files
| Type | Pattern | Example |
|---|---|---|
| Adapter | `{module}_adapter.ts` | `ledger_adapter.ts` |
| Mapper | `{entity}.mapper.ts` | `account.mapper.ts` |
| Composable | `use{Action}.ts` | `useLedgerAccounts.ts` |
| Types | `{entity}.types.ts` | `account.types.ts` |
| Formatter | `{entity}-formatter.ts`| `account-formatter.ts` |
| Routes | `routes.ts` | — |
| Entry | `index.ts` | — |

### Data Types
- **DTOs**: Raw as-received-from-server types (from `generated.types.ts`).
- **Domain Types**: Clean, reactive frontend-owned interfaces.
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
import { Money } from '@/core/domain/money'
import { httpClient } from '@/core/api/http-client'

// ✅ ALLOWED: Module imports from itself
import { useLedgerAccounts } from '../application/composables/useLedgerAccounts'
import { mapAccount } from '../infrastructure/ledger.mapper'

// ❌ BANNED: Module imports from another module
import { usePaymentStore } from '@/modules/business/finance/ap/payment-requests/...'
```

### 4.2 ESLint Rule Configuration
```javascript
// eslint.config.js
{
  'no-restricted-imports': ['error', {
    patterns: [
      {
        group: ['@/modules/*/stores/*', '@/modules/*/api/*', '@/modules/*/composables/*'],
        message: 'Cross-module imports are prohibited. Use the Event Bus or Core types.',
      }
    ]
  }]
}
```

### 4.3 Data Flow Between Modules

```
Module A (Payment Requests)          Module B (Accounting)
┌──────────────────────────┐        ┌──────────────────────────┐
│ usePayRequest()          │        │ useJournalEntries()      │
│  └── paymentApi.pay()    │        │  └── accountingApi.list()│
│      └── eventBus.emit() ├──┐     │                          │
│         'pr:paid'        │  │     │ eventBus.on('pr:paid')   │
└──────────────────────────┘  │     │  └── refreshEntries()    │
                               │     └──────────────────────────┘
                               │                  ▲
                               └──────────────────┘
                            Event Bus (Shared Kernel)
```

---

## 5. Route Registration Pattern

Each module exports a `ModuleDefinition` that includes its routes, permissions, and menu items:

```typescript
// modules/business/finance/ledger/index.ts
import type { ModuleDefinition } from '@/core/types/module.types'

export const ledgerModule: ModuleDefinition = {
  id: 'ledger',
  name: 'General Ledger',
  category: 'business',
  routes: () => import('./routes').then(m => m.default),
  permissions: ['ledger.view', 'ledger.edit'],
  menuItems: [
    { label: 'Chart of Accounts', route: 'LedgerCoa', icon: 'book-open' },
  ],
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
  mod.routes().then(routes => {
    routes.forEach(route => router.addRoute('app', route))
  })
}
```

---

When creating a new module (e.g., `procurement`):

- [ ] Create directory under `src/modules/business/` or `src/modules/platform/`
- [ ] Implement `domain/{entity}.types.ts`
- [ ] Implement `infrastructure/{module}_adapter.ts` (Fetches **DTOs**)
- [ ] Implement `infrastructure/{module}.mapper.ts` (**DTO → Domain** mapping)
- [ ] Implement `application/composables/use{Entity}.ts` (Orchestrated by **TanStack Query**)
- [ ] Implement `ui/` (Pages, Components, Formatters)
- [ ] Create `index.ts` — `ModuleDefinition` export
- [ ] Register module in `src/modules/registry.ts`
