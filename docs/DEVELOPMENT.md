# Development Guide

> **Parent:** [Documentation Overview](docs/OVERVIEW.md)

---

## 1. Prerequisites

| **Environment** | **Vite+ (`vp`)** | Unified Build & Toolchain CLI |
| **Node.js** | 20 LTS+ | JavaScript runtime |
| **pnpm** | 10+ | Recommended package manager |
| **Git** | 2.40+ | Version control |
| **VS Code** | Latest | Recommended IDE |

### Recommended VS Code Extensions

- **Vue - Official** (`Vue.volar`) — Vue 3 + TypeScript support
- **ESLint** — Linting
- **Prettier** — Formatting
- **Vue VSCode Snippets** — SFC boilerplate

---

## 2. Quick Start

```bash
# Clone (assumes abren-api already exists as sibling)
cd ~/python-projects/abren-erp
git clone <repo-url> abren-ui
cd abren-ui

# Install dependencies
vp install

# Generate API types (requires backend running on port 8000)
vp run generate-types

# Start dev server
vp dev
```

---

## 3. Available Scripts

| Command                 | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `vp dev`                | Start Vite dev server with HMR                   |
| `vp build`              | Production build                                 |
| `vp preview`            | Preview production build locally                 |
| `vp run generate-types` | Regenerate TypeScript types from backend OpenAPI |
| `vp run generate`       | Scaffold a strict 4-layer architectural module   |
| `vp lint`               | Run Oxlint                                       |
| `vp fmt`                | Run Oxfmt                                        |
| `vp check`              | Run unified type-check, lint, and format         |
| `vp test`               | Run Vitest unit tests                            |
| `vp run test:e2e`       | Run Playwright E2E tests                         |

---

## 4. Coding Standards

### 4.1 TypeScript Rules

- **Strict mode**: `"strict": true` in `tsconfig.json`. No exceptions.
- **No `any`**: Use `unknown` + type guards instead.
- **Branded types** for domain IDs:
  ```typescript
  type TenantId = string & { readonly __brand: 'TenantId' }
  type UserId = string & { readonly __brand: 'UserId' }
  ```
- **Exhaustive switch**: Always handle all enum variants:
  ```typescript
  function getStatusColor(status: PaymentRequestStatus): string {
    switch (status) {
      case 'DRAFT':
        return 'gray'
      case 'SUBMITTED':
        return 'blue'
      case 'APPROVED':
        return 'green'
      case 'REJECTED':
        return 'red'
      case 'PAID':
        return 'emerald'
      default: {
        const _exhaustive: never = status
        throw new Error(`Unhandled status: ${_exhaustive}`)
      }
    }
  }
  ```

### 4.2 Vue Component Rules

- **Composition API only** (no Options API).
- **`<script setup lang="ts">`** for all components.
- **Scoped styles**: Always use `<style scoped>`. Inline `style="..."` is banned.
- **Props and emits**: Always typed with `defineProps<T>()` and `defineEmits<T>()`.
- **Single Responsibility**: One component = one concern.
- **Composable Logic**: All orchestration logic (API calls, state management, toasts) MUST live in a Composable. `.vue` files should be thin view layers.
- **Unbreakable DRY**: Never duplicate domain-specific UI patterns. If a pattern repeats twice, it's a candidate for `core/ui` or a module-level component.

### 4.3 Naming Conventions

| Type           | Convention | Example                 | Location          |
| -------------- | ---------- | ----------------------- | ----------------- |
| Vue components | PascalCase | `AccountBadge.vue`      | `ui/components/`  |
| List Page      | PascalCase | `AccountListPage.vue`   | `ui/pages/`       |
| Detail Page    | PascalCase | `AccountDetailPage.vue` | `ui/pages/`       |
| Editor Page    | PascalCase | `AccountEditPage.vue`   | `ui/pages/`       |
| Create Page    | PascalCase | `AccountCreatePage.vue` | `ui/pages/`       |
| Wizard Page    | PascalCase | `OnboardingWizard.vue`  | `ui/pages/`       |
| Form Drawer    | PascalCase | `AccountFormDrawer.vue` | `ui/components/`  |
| Grid Configs   | dot-suffix | `account.grid.ts`       | `ui/grids/`       |
| UI Utils       | kebab-case | `account-formatter.ts`  | `ui/utils/`       |
| Composables    | camelCase  | `useLedgerAccounts.ts`  | `application/`    |
| Adapters       | snake_case | `ledger_adapter.ts`     | `infrastructure/` |
| Mappers        | dot-suffix | `ledger.mapper.ts`      | `infrastructure/` |
| Types          | dot-suffix | `account.types.ts`      | `domain/models/`  |

### 4.4 Import Order

```typescript
// 1. Framework & Core Primitives
import { ref, computed } from 'vue'
import { Button } from '@/core/ui/button'
import { DataGrid, useDataGrid } from '@/core/ui/data-grid'

// 2. Application Layer (Orchestration)
import { useLedgerAccounts } from '../../application/composables/useLedgerAccounts'

// 3. UI Layer (Configuration & Logic)
import { accountColumns } from '../grids/account.grid'
import { formatAccountCode } from '../utils/account-formatter'

// 4. Domain & Infrastructure (Implementation)
import { toEntity } from '../../infrastructure/ledger.mapper'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
```

---

## 5. Git Workflow

### 5.1 Branch Naming

```
feature/{module}/{description}     e.g. feature/accounting/journal-entry-form
fix/{module}/{description}         e.g. fix/identity/login-redirect
docs/{description}                 e.g. docs/testing-strategy
refactor/{module}/{description}    e.g. refactor/core/http-client-interceptors
```

### 5.2 Commit Messages (Conventional Commits)

```
feat(accounting): add journal entry form with line grid
fix(identity): resolve login redirect after token expiry
docs(architecture): update state management patterns
refactor(core): extract idempotency key generator
test(payment-requests): add mapper unit tests
```

### 5.3 Pre-Commit Checks

Before every commit:

1. `vp check --fix` — Auto-fix linting and formatting issues
2. `vp test` — Run unit tests

---

## 6. Environment Variables

All environment variables are prefixed with `VITE_` for Vite exposure:

| Variable            | Default                 | Description          |
| ------------------- | ----------------------- | -------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_APP_TITLE`    | `Abren ERP`             | Application title    |

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000

# .env.production
VITE_API_BASE_URL=https://api.abren.app
```

---

## 7. Design Tokens & Styling

### 7.1 Tailwind v4 Design Tokens

All visual tokens are defined in `src/assets/main.css` using Tailwind v4's `@theme` directive:

```css
@import 'tailwindcss';

@theme {
  /* Colors */
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}
```

### 7.2 Rules

- **Always use `core/ui/` components** — never raw HTML elements for buttons, inputs, or tables.

---

## 8. High-Integrity Module Structure

Every module MUST adhere to the **4-Layer Architecture** to prevent logic leakage and ensure scalability.

```text
src/modules/{category}/{module}/
├── infrastructure/        # EXTERNAL WORLD (ACL)
│   ├── api.types.ts       # Generated DTO re-exports
│   ├── {name}_adapter.ts  # HTTP calls & path resolution
│   └── {name}.mapper.ts   # DTO → Entity transformation
└── ui/                    # PRESENTATION
    ├── components/        # Stateless molecules
    ├── pages/             # Stateful orchestrators
    ├── grids/             # Column definitions (DataGrid)
    └── utils/             # Formatters & display logic
```

### 8.1 Module Generation (The Paved Road)

**Never manually create a module directory tree.** We enforce strict boundary rules via ESLint, so it is critical that the boilerplate is generated perfectly to prevent tooling errors.

To create a new module, use the built-in generator script:

```bash
vp run generate business/crm/customers
```

This instantly creates the strict 4-layer structure and wires up the `index.ts`, routing, and domain entry points. All you need to do is register the generated export in `src/modules/index.ts`.

### 8.1 The "Gold Standard" Blueprint

When starting a new module or refactoring an old one, use the **Finance / Ledger** module as the reference implementation. It is the first module to achieve full High-Integrity alignment.

- **Grid Config**: [account.grid.ts](file:///Users/yuma/python-projects/abren-erp/abren-ui/src/modules/business/finance/ledger/ui/grids/account.grid.ts)
- **Application Logic**: [useLedgerAccounts.ts](file:///Users/yuma/python-projects/abren-erp/abren-ui/src/modules/business/finance/ledger/application/composables/useLedgerAccounts.ts)
- **Domain Mapping**: [ledger.mapper.ts](file:///Users/yuma/python-projects/abren-erp/abren-ui/src/modules/business/finance/ledger/infrastructure/ledger.mapper.ts)

---

## 9. Specialized Agent Skills & Toolchain Mastery

The Abren ERP project is optimized for both human and AI-agent developers. We leverage a unified toolchain and specialized Agent Skills to maintain high-integrity code.

### 9.1 The Vite+ Unified Toolchain (`vp`)

We use **Vite+** (`vp`) as our single entry point for all development tasks. It wraps Vite, Vitest, Oxlint, Oxfmt, and Rolldown.

- **Human Workflow**: Use `vp dev`, `vp test`, and `vp check` instead of fragmented tool commands.
- **Agent Workflow**: Always use the `vp` CLI for build, test, and linting verification. Reference the [Vite+ Skill Docs](file:///Users/yuma/python-projects/abren-erp/abren-ui/node_modules/vite-plus/skills/vite-plus/SKILL.md) for advanced usage rules.

### 9.2 TanStack Devtools & Observability

For advanced debugging and state inspection, we use the **TanStack Devtools Event System**.

- **Instrumentation**: Place strategic `emit()` calls at architecture boundaries (Middleware entry/exit, State Transitions).
- **Bidirectional Communication**: The Devtools panel can send commands (e.g., `reset`, `set-state`) back to the application.
- **Reference**: See the [Devtools Event Client Skill](file:///Users/yuma/python-projects/abren-erp/abren-ui/node_modules/@tanstack/devtools-event-client/skills/devtools-event-client/SKILL.md) for implementation patterns.

---

## 10. In-Code Documentation Standard

### Philosophy

Comments should answer questions the code cannot. The _what_ is already in the code — comments explain the _why_, the _tradeoff_, or the _constraint_ that led to a decision.

**Write a comment when:**

- The logic is non-obvious or involves a known edge case
- A security invariant is being enforced
- A business rule drives a technical choice
- A workaround exists for a known library bug or limitation
- A complex algorithm or reactive dependency chain is implemented

**Do not write a comment when:**

- It merely restates the code
- The function name already communicates intent clearly

Comments are code. They must be updated when the logic changes, and deleted when they go stale.

---

### Module-Level JSDoc

Required for all files in `core/` and for non-trivial module entry points. State the file's responsibility and any architectural constraints.

```typescript
/**
 * Abren ERP — Shared HTTP Client
 *
 * Responsibilities:
 * - Unwrap the backend's { success, data, meta } envelope
 * - Attach Idempotency-Key for mutating requests
 * - Centralized error handling
 */
```

---

### Composable JSDoc

Required for all exported composables. Include a `@example` block when the usage pattern is not immediately obvious.

```typescript
/**
 * useFeatureGate
 *
 * Mirrors the backend's FeatureGate dependency.
 * Checks if a feature is enabled for the current tenant.
 *
 * @example
 *   const { isEnabled } = useFeatureGate('webhooks')
 *   if (!isEnabled.value) { // hide UI }
 */
```

---

### Vue Component JSDoc

Required in `<script setup>` for all components outside `core/ui/` (primitive UI components are exempt). Describe:

- The component's purpose
- How it sources its data (props, store, composable)
- Any non-obvious template behavior

```typescript
/**
 * AccountListPage
 *
 * Displays the paginated ledger account list for the current tenant.
 * Data is fetched via `useLedgerAccounts` composable (TanStack Query).
 * Row actions (edit, archive) emit events via the typed event bus.
 */
```

---

### Inline Comments

Follow the "why not what" rule. Use section markers to break up long files:

```typescript
// ── Types ─────────────────────────────────────────────
// ── Request Interceptor ────────────────────────────────
```

---

### Type Annotations

Mandatory everywhere. `any` is banned — use `unknown` with type guards. See Section 4.1 for the full TypeScript rules.

> [!TIP]
> **Always run `vp check --fix` before committing.** This ensures that our Oxlint and Oxfmt rules are strictly enforced and the codebase remains in a high-integrity state.
