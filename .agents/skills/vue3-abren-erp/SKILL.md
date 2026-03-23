---
name: Vue 3 Abren ERP Development
description: Comprehensive patterns, conventions, and code examples for developing the Abren ERP UI with Vue 3 Composition API, Pinia, TypeScript, and DDD-aligned module architecture. Use this skill for ALL Vue code generation in this project.
---

# Vue 3 Abren ERP Development Skill

## CRITICAL: Always Follow These Rules

1. **ALWAYS** use Vue 3 **Composition API** with `<script setup lang="ts">`. **NEVER** use Options API.
2. **ALWAYS** use TypeScript strict mode. **NEVER** use `any`.
3. **ALWAYS** use **TanStack Query** for all domain/server state. **NEVER** put domain data in Pinia.
4. **ALWAYS** adhere to the **4-Layer Architecture** (Domain, Application, Infrastructure, UI).
5. **ALWAYS** use **props-in, events-out** for component communication.
6. **ALWAYS** use **Reka UI / shadcn-vue** primitives from `@/core/ui/`.
7. **ALWAYS** use Tailwind v4 design tokens via `@theme` variables in `src/assets/main.css`.
8. **NEVER** import from another module's internals (Infrastructure/Application/UI). Only use shared `platform/` modules or the module's own layers.

---

## Project Structure

```
src/
├── app/              # Application shell (router, layouts, main.ts)
├── core/             # Shared Kernel (cross-cutting concerns)
│   ├── api/          # HTTP client, interceptors
│   ├── ui/           # Design System (Reka UI / shadcn-vue)
│   ├── auth/         # Auth store
│   ├── domain/       # Shared value objects (Money, Currency)
│   └── composables/  # Generic hooks (useDataGrid, useAsync)
├── modules/          # Bounded Contexts (Monolith)
│   ├── business/     # Feature-Rich Modules (Ledger, Procurement)
│   └── platform/     # Cross-Cutting Services (Identity, Workflows)
└── assets/           # Global styles and Tailwind v4 theme
```

Each module has this internal structure:

```
modules/{category}/{module}/
├── domain/                # 1. PURE BUSINESS LOGIC
│   ├── models/            # Entity Types & Value Objects
│   └── mappers/           # DTO → Entity transformation
├── application/           # 2. ORCHESTRATION
│   └── composables/       # TanStack Query logic, Use Cases
├── infrastructure/        # 3. EXTERNAL WORLD
│   ├── api.types.ts       # Generated DTO re-exports
│   └── {name}_adapter.ts  # HTTP calls & path resolution
└── ui/                    # 4. PRESENTATION
    ├── components/        # Molecules & Atoms
    ├── pages/             # Stateful route orchestrators
    ├── grids/             # Column definitions (DataGrid)
    ├── store/             # Ephemeral UI State (Pinia)
    └── utils/             # Formatters & display logic
```

---

## Pattern 1: High-Integrity SFC (Page Orchestrator)

Pages are the stateful entry points of a module. They compose shared **Engines** (DataGrid) with module-specific **Application Logic** (Composables).

```vue
<!-- modules/business/ledger/ui/pages/LedgerAccountsPage.vue -->
<script setup lang="ts">
import { useRouter } from "vue-router";
import { DataGrid, useDataGrid } from "@/core/ui/data-grid";
import { Button } from "@/core/ui/button";
import { useLedgerAccounts } from "../../application/composables/useLedgerAccounts";
import { accountColumns } from "../grids/account.grid";

const router = useRouter();

// 1. Application Layer (Domain state)
const { accounts, isLoading, error } = useLedgerAccounts();

// 2. UI Layer (Local ephemeral grid state)
const { gridState } = useDataGrid();

function handleRowClick(account: any) {
  router.push({ name: 'ledger.account-detail', params: { id: account.id } });
}
</script>

<template>
  <div class="p-6 space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Chart of Accounts</h1>
        <p class="text-sm text-muted-foreground">Manage your fiscal account structure.</p>
      </div>
      <Button @click="router.push({ name: 'ledger.account-create' })">
        New Account
      </Button>
    </header>

    <DataGrid
      :data="accounts"
      :columns="accountColumns"
      :loading="isLoading"
      :state="gridState"
      @row-click="handleRowClick"
    />
  </div>
</template>
```

> **Thin Pages, Logic-Rich Composables.** The SFC should focus on layout and event routing. All business orchestration belongs in the `application/` layer.

---

## Pattern 2: Ephemeral UI State (Pinia)

Pinia is strictly for **ephemeral UI state**. **NEVER** duplicate domain data (Server State) in Pinia stores.

```typescript
// modules/business/ledger/ui/store/ledger-ui.store.ts
import { defineStore } from "pinia";
import { ref } from "vue";

export const useLedgerUIStore = defineStore("ledger-ui", () => {
  const isFilterPanelVisible = ref(false);
  const density = ref<'comfortable' | 'compact'>('compact');

  function toggleFilters() {
    isFilterPanelVisible.value = !isFilterPanelVisible.value;
  }

  function $reset() {
    isFilterPanelVisible.value = false;
    const activeView = ref('grid');
    const selectedAccountId = ref<string | null>(null);
  }

  return { isFilterPanelVisible, density, toggleFilters, $reset };
});
```

**WRONG (Options syntax — NEVER use this):**

```typescript
// ❌ DO NOT USE THIS PATTERN
export const useStore = defineStore('name', {
  state: () => ({ ... }),
  getters: { ... },
  actions: { ... },
})
```

---

## Pattern 3: Application Composable (Use Case)

Composables orchestrate data flow between the **Infrastructure Layer** (Adapters) and the **UI Layer**.

```typescript
// modules/business/finance/ledger/application/composables/useLedgerAccounts.ts
import { useQuery } from "@tanstack/vue-query";
import { ledgerAdapter } from "../../infrastructure/ledger_adapter";
import { mapToAccount } from "../../domain/mappers/ledger.mapper";

export function useLedgerAccounts() {
  const {
    data: accounts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ledger-accounts"],
    queryFn: async () => {
      const dtos = await ledgerAdapter.list();
      return dtos.map(mapToAccount);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { accounts, isLoading, error, refetch };
}
```

> [!TIP]
> **Use raw `useQuery`** for local module orchestration. The core `useApiQuery` is reserved for infrastructure-level caching across bounded contexts.

### Action-Oriented Composable (Mirrors Backend Action Endpoint)

```typescript
// modules/payment-requests/composables/useSubmitRequest.ts
import { useApiMutation } from "@/core/composables/useApiMutation";
import { paymentRequestApi } from "../api/payment-requests.api";
import { toViewModel } from "../mappers/payment-request.mapper";
import { eventBus } from "@/core/event-bus/event-bus";

export function useSubmitRequest() {
  return useApiMutation(
    async (id: string) => {
      // 1. Call action endpoint
      const dto = await paymentRequestApi.submit(id);
      return toViewModel(dto);
    },
    {
      onSuccess: (vm) => {
        // 2. Notify other modules
        eventBus.emit("payment-request:submitted", { id: vm.id });
      },
      invalidateKeys: [["payment-requests"]], // Invalidate list query
    },
  );
}
```

---

## Pattern 4: Infrastructure Adapter

Adapters handle HTTP state and path resolution. They are the **only** layer that knows about the Core `httpClient`.

```typescript
// modules/business/finance/ledger/infrastructure/ledger_adapter.ts
import { httpClient } from "@/core/api/http-client";
import type { LedgerAccountDTO } from "./api.types";

const BASE = "/finance/ledger/accounts";

export const ledgerAdapter = {
  list: (): Promise<LedgerAccountDTO[]> => httpClient.get(BASE),
  get: (id: string): Promise<LedgerAccountDTO> => httpClient.get(`${BASE}/${id}`),
};
```

---

## Pattern 5: Domain Mapper

Mappers transform outside DTOs into inside **Domain Entities**.

```typescript
// modules/business/finance/ledger/domain/mappers/ledger.mapper.ts
import { Money } from "@/core/domain/money";
import type { LedgerAccountDTO } from "../../infrastructure/api.types";
import type { LedgerAccount } from "../models/account.types";

export function mapToAccount(dto: LedgerAccountDTO): LedgerAccount {
  return {
    id: dto.id,
    code: dto.account_code,
    name: dto.name,
    type: dto.type,
    balance: Money.from(dto.current_balance, dto.currency),
    isSystem: dto.is_system_account,
    metadata: {
      lastPosted: dto.last_posted_at,
      version: dto.version
    }
  };
}
```

---

## Pattern 6: Types & Models (4-Layer Isolation)

### 6.1 Infrastructure Layer (DTOs)
```typescript
// modules/business/finance/ledger/infrastructure/api.types.ts
export interface AccountDTO {
  id: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  balance: number;
  currency: string;
  is_system_account: boolean;
  version: number;
  last_posted_at: string | null;
}
```

### 6.2 Domain Layer (Entities)
```typescript
// modules/business/finance/ledger/domain/models/account.types.ts
import type { Money } from "@/core/domain/money";

export interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: Money; // Value Object
  isSystem: boolean;
  metadata: {
    lastPosted: string | null;
    version: number;
  };
}
```

---

## Pattern 7: Route Definition

```typescript
// modules/payment-requests/routes.ts
import type { RouteRecordRaw } from "vue-router";

export const paymentRequestRoutes: RouteRecordRaw[] = [
  {
    path: "/payments",
    meta: { requiresAuth: true, feature: "payment_requests" },
    children: [
      {
        path: "",
        name: "payments.list",
        component: () => import("./pages/PaymentRequestListPage.vue"),
      },
      {
        path: ":id",
        name: "payments.detail",
        component: () => import("./pages/PaymentRequestDetailPage.vue"),
        props: true,
      },
      {
        path: "create",
        name: "payments.create",
        component: () => import("./pages/PaymentRequestCreatePage.vue"),
      },
    ],
  },
];
```

---

## Pattern 8: Page Component

Pages are thin — they compose components and call composables.

```vue
<!-- modules/payment-requests/pages/PaymentRequestListPage.vue -->
<script setup lang="ts">
import { useRouter } from "vue-router";
import { usePaymentRequests } from "../composables/usePaymentRequests";
import PaymentRequestList from "../components/PaymentRequestList.vue";
import type { PaymentRequestViewModel } from "../types/view.types";

const router = useRouter();
const { requests, isLoading, error, refresh } = usePaymentRequests();

function handleSelect(request: PaymentRequestViewModel) {
  router.push({ name: "payments.detail", params: { id: request.id } });
}

function handleCreate() {
  router.push({ name: "payments.create" });
}
</script>

<template>
  <div class="page">
    <PaymentRequestList
      :requests="requests"
      :is-loading="isLoading"
      :error="error"
      @select="handleSelect"
      @create="handleCreate"
      @refresh="refresh"
    />
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

---

## Pattern 9: Shared Kernel Value Object

```typescript
// core/domain/money.ts
export enum Currency {
  ETB = "ETB",
  USD = "USD",
  EUR = "EUR",
}

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency | string,
  ) {}

  static from(amount: number, currency: Currency | string): Money {
    return new Money(amount, currency);
  }

  static zero(currency: Currency | string): Money {
    return new Money(0, currency);
  }

  format(locale: string = "en-ET"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: String(this.currency),
      minimumFractionDigits: 2,
    }).format(this.amount);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot add ${this.currency} and ${other.currency}`);
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot subtract ${this.currency} and ${other.currency}`);
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }
}
```

---

## Pattern 10: Typed Event Bus

```typescript
// core/event-bus/event-bus.ts
import type { Money } from "@/core/domain/money";

export type EventMap = {
  "payment-request:submitted": { id: string };
  "payment-request:approved": { id: string };
  "payment-request:rejected": { id: string; reason: string };
  "payment-request:paid": { id: string; amount: Money };
  "journal-entry:posted": { id: string; entryNumber: string };
  "journal-entry:voided": { id: string };
  "tenant:switched": { tenantId: string };
  "tenant:feature-toggled": { feature: string; enabled: boolean };
  "auth:logged-out": Record<string, never>;
};

type EventHandler<T> = (payload: T) => void;

class TypedEventBus {
  private listeners = new Map<string, Set<Function>>();

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const handlers = this.listeners.get(event as string);
    if (handlers) {
      handlers.forEach((handler) => handler(payload));
    }
  }

  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
    if (!this.listeners.has(event as string)) {
      this.listeners.set(event as string, new Set());
    }
    this.listeners.get(event as string)!.add(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    this.listeners.get(event as string)?.delete(handler);
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new TypedEventBus();
```

---

## Pattern 11: Unit Test (Mapper)

```typescript
// modules/business/finance/ledger/domain/mappers/__tests__/ledger.mapper.test.ts
import { describe, it, expect } from "vitest";
import { mapToAccount } from "../ledger.mapper";
import type { LedgerAccountDTO } from "../../../infrastructure/api.types";

const baseDTO: LedgerAccountDTO = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  account_code: "1000",
  name: "Main Cash",
  type: "ASSET",
  current_balance: 15000.5,
  currency: "ETB",
  is_system_account: false,
  version: 1,
  last_posted_at: "2026-03-20T15:30:00Z",
};

describe("Ledger Mapper", () => {
  it("maps DTO to LedgerAccount entity", () => {
    const entity = mapToAccount(baseDTO);
    expect(entity.name).toBe("Main Cash");
    expect(entity.balance.amount).toBe(15000.5);
    expect(entity.balance.currency).toBe("ETB");
  });

  it("handles metadata nesting", () => {
    const entity = mapToAccount(baseDTO);
    expect(entity.metadata.version).toBe(1);
    expect(entity.metadata.lastPosted).toBe("2026-03-20T15:30:00Z");
  });
});
```

---

## Import Aliases

Always use these path aliases:

```typescript
// ✅ Correct imports
import { Money } from "@/core/domain/money";
import { httpClient } from "@/core/api/http-client";
import { eventBus } from "@/core/event-bus/event-bus";

// ✅ Module-internal (relative preferred)
import { useLedgerUIStore } from "../ui/store/ledger-ui.store";
import { mapAccount } from "../../domain/mappers/ledger.mapper";

// ❌ BANNED: Cross-module internal imports
import { useLedgerStore } from "@/modules/business/finance/ledger/ui/store/ledger-ui.store";
```

---

## Common Reactivity Mistakes to Avoid

```typescript
// ❌ WRONG: Destructuring loses reactivity
const { requests } = usePaymentRequestStore()

// ✅ CORRECT: Use storeToRefs for reactive destructuring
const { requests } = storeToRefs(usePaymentRequestStore())

// ❌ WRONG: ref for complex objects
const formData = ref({ name: '', amount: 0 })

// ✅ CORRECT: reactive for objects, ref for primitives
const formData = reactive({ name: '', amount: 0 })
const isSubmitting = ref(false)

// ❌ WRONG: Forgetting .value in script
if (isLoading) { ... }

// ✅ CORRECT: Always use .value in <script>, never in <template>
if (isLoading.value) { ... }
```

---

## Backend API Conventions

The backend uses these patterns that the UI must align with:

- **Action-oriented endpoints**: `POST /{resource}/{id}/{action}` (never `PATCH` for state changes)
- **Response envelope**: `{ success: true, data: { ... } }` or `{ success: false, detail: "...", code: "..." }`
- **Idempotency**: All mutating requests must send an `Idempotency-Key` header
- **Tenant context**: Always include tenant ID in auth headers
- **Date format**: All dates are UTC ISO 8601 strings

---

## Specialized Agent Skills & MASTERY

This skill document is optimized for high-integrity autonomous development.

### 1. Toolchain Alignment
- **Verification**: Always run `vp check` and `vp test` after generating code.
- **Rules**: Refer to the [Vite+ Master Skill](file:///Users/yuma/python-projects/abren-erp/abren-erp-ui/node_modules/vite-plus/skills/vite-plus/SKILL.md) for CLI standards.
## Pattern 12: Unified Toolchain (Vite+ / pnpm)

We use **Vite+** (`vp`) as our single toolchain entry point, backed by **pnpm** for high-efficiency link-based dependency management.

- **`vp install`**: Replaces `npm install`. Standardizes lockfile generation (`pnpm-lock.yaml`).
- **`vp check`**: Unified command for linting (**Oxlint**), formatting (**Oxfmt**), and type-checking (**vue-tsc**).
- **`vp dev / vp test / vp build`**: All standard Vite/Vitest tasks are performed through the `vp` CLI.

> [!CAUTION]
> **NEVER** use `npm` or `yarn`. These are legacy package managers and will cause lockfile fragmentation.

---

### 2. High-Integrity Diagnostic (Devtools)
- **Instrumentation**: Every major state transition MUST emit a domain event via `@tanstack/devtools-event-client`.
- **Bidirectional**: Use the `EventClient` for enabling devtools-to-app commands (e.g., "Revert to Previous Fiscal State").
- **Reference**: [Devtools Instrumentation Skill](file:///Users/yuma/python-projects/abren-erp/abren-erp-ui/node_modules/@tanstack/devtools-event-client/skills/devtools-instrumentation/SKILL.md).

### 3. Agent Performance Grade: MASTER
- **Honesty**: Refuse to generate code that mixes layers or duplicates domain state in Pinia.
- **Accuracy**: Ensure all imports use the bifurcated `business/` vs `platform/` category system.
- **Elegance**: Use Reka UI primitives to ensure maximum accessibility and performance.
