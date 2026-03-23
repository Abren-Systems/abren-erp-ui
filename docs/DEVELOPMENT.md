# Development Guide

> **Parent:** [Documentation Overview](docs/OVERVIEW.md)

---

## 1. Prerequisites

| Tool        | Version | Purpose            |
| ----------- | ------- | ------------------ |
| **Node.js** | 20 LTS+ | JavaScript runtime |
| **npm**     | 10+     | Package manager    |
| **Git**     | 2.40+   | Version control    |
| **VS Code** | Latest  | Recommended IDE    |

### Recommended VS Code Extensions

- **Vue - Official** (`Vue.volar`) — Vue 3 + TypeScript support
- **ESLint** — Linting
- **Prettier** — Formatting
- **Vue VSCode Snippets** — SFC boilerplate

---

## 2. Quick Start

```bash
# Clone (assumes abren-erp-api already exists as sibling)
cd ~/python-projects/abren-erp
git clone <repo-url> abren-erp-ui
cd abren-erp-ui

# Install dependencies
vp install

# Generate API types (requires backend running on port 8000)
vp run generate-types

# Start dev server
vp dev
```

---

## 3. Available Scripts

| Command           | Description                                      |
| ----------------- | ------------------------------------------------ |
| `vp dev`          | Start Vite dev server with HMR                   |
| `vp build`        | Production build                                 |
| `vp preview`      | Preview production build locally                 |
| `vp run generate-types` | Regenerate TypeScript types from backend OpenAPI |
| `vp lint`         | Run Oxlint                                 |
| `vp fmt`          | Run Oxfmt                                  |
| `vp check`        | Run unified type-check, lint, and format         |
| `vp test`         | Run Vitest unit tests                            |
| `vp run test:e2e` | Run Playwright E2E tests                         |

---

## 4. Coding Standards

### 4.1 TypeScript Rules

- **Strict mode**: `"strict": true` in `tsconfig.json`. No exceptions.
- **No `any`**: Use `unknown` + type guards instead.
- **Branded types** for domain IDs:
  ```typescript
  type TenantId = string & { readonly __brand: "TenantId" };
  type UserId = string & { readonly __brand: "UserId" };
  ```
- **Exhaustive switch**: Always handle all enum variants:
  ```typescript
  function getStatusColor(status: PaymentRequestStatus): string {
    switch (status) {
      case "DRAFT":
        return "gray";
      case "SUBMITTED":
        return "blue";
      case "APPROVED":
        return "green";
      case "REJECTED":
        return "red";
      case "PAID":
        return "emerald";
      default: {
        const _exhaustive: never = status;
        throw new Error(`Unhandled status: ${_exhaustive}`);
      }
    }
  }
  ```

### 4.2 Vue Component Rules

- **Composition API only** (no Options API).
- **`<script setup lang="ts">`** for all components.
- **Scoped styles**: Always use `<style scoped>`.
- **Props and emits**: Always typed with `defineProps<T>()` and `defineEmits<T>()`.
- **Single Responsibility**: One component = one concern.

### 4.3 Naming Conventions

| Type           | Convention | Example                  |
| -------------- | ---------- | ------------------------ |
| Directories    | kebab-case | `payment-requests/`      |
| Vue components | PascalCase | `PaymentRequestForm.vue` |
| Composables    | camelCase  | `usePaymentRequests.ts`  |
| Adapters       | snake_case | `ledger_adapter.ts`      |
| Mappers        | dot-suffix | `ledger.mapper.ts`       |
| Types          | dot-suffix | `account.types.ts`       |
| Formatters     | kebab-case | `account-formatter.ts`   |

### 4.4 Import Order

```typescript
// 1. Vue/framework imports
import { ref, computed } from "vue";
import { useQuery } from "@tanstack/vue-query";

// 2. Core infrastructure imports
import { Money } from "@/core/domain/money";
import { Button } from "@/core/ui/button";

// 3. Module orchestration (Application)
import { useLedgerAccounts } from "../application/composables/useLedgerAccounts";

// 4. Domain & Infrastructure
import type { Account } from "../domain/account.types";
import { ledgerAdapter } from "../infrastructure/ledger_adapter";
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
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}
```

### 7.2 Rules

- **No hardcoded colors** in component styles — use Tailwind utilities with design tokens.
- **Scoped styles** in every component.
- **Dark mode**: Support via `[data-theme="dark"]` attribute on `<html>`.
- **Always use `core/ui/` components** — never raw HTML elements for buttons, inputs, or tables.
