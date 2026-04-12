---
name: Vue 3 Abren ERP Development
description: Comprehensive patterns, conventions, and code examples for developing the Abren ERP UI with Vue 3 Composition API, Pinia, TypeScript, and DDD-aligned module architecture. Use this skill for ALL Vue code generation in this project.
---

# Vue 3 Abren ERP Development Skill

## CRITICAL: Always Follow These Rules

1. **ALWAYS** use Vue 3 **Composition API** with `<script setup lang="ts">`. **NEVER** use Options API.
2. **ALWAYS** use TypeScript strict mode. **NEVER** use `any`.
3. **ALWAYS** use **TanStack Query** for all domain/server state via `useApiQuery`/`useApiMutation`. **NEVER** put domain data in Pinia. Enforce `TError = ApiError`.
4. **ALWAYS** adhere to the **4-Layer Architecture** (Domain, Application, Infrastructure, UI).
5. **ALWAYS** use **props-in, events-out** for component communication.
6. **ALWAYS** use **Reka UI / shadcn-vue** primitives from `@/shared/components/`.
7. **NEVER** import from another module's internals (Infrastructure/Application/UI). Only interface via EventBus.
8. **NEVER** dump domain logic into `shared/`. The Shared Kernel follows the **Leaf Node Rule** (it cannot import from `modules/`).
9. **ALWAYS** use **TSDoc** for composables, mappers, and adapters. Omit raw `{type}` markers as TypeScript is the source of truth.
10. **ALWAYS** use the **Mapper-as-Factory** class pattern for the Anti-Corruption Layer (Infrastructure).

---

## Project Structure

```
src/
├── app/              # Application shell (router, layouts, main.ts)
├── shared/           # Shared Kernel (cross-cutting technical concerns)
│   ├── api/          # HTTP client, interceptors, generated types
│   ├── components/   # Design System (Reka UI / shadcn-vue)
│   ├── auth/         # Auth store
│   ├── domain/       # Shared value objects (Money, Currency)
│   └── types/        # Global interfaces and Branded IDs
├── modules/          # Bounded Contexts (Monolith - Flat Structure)
│   ├── finance/      # Finance Domain Area
│   │   ├── ledger/   # General Ledger
│   │   ├── ap/       # Accounts Payable
│   │   ├── bank/     # Banking & Treasury
│   │   └── tax/      # Taxation Sub-domain
│   ├── core/         # Tenant & Auth Identity domain
│   └── workflows/    # Passive state machine domain
└── assets/           # Global styles and Tailwind v4 theme
```

Each module has this internal 4-layer structure:

```
modules/{area}/{module}/
├── domain/                # 1. PURE BUSINESS LOGIC (Entities, Value Objects)
├── application/           # 2. ORCHESTRATION (Use Cases, Composables)
├── infrastructure/        # 3. EXTERNAL WORLD (Adapters, Mappers, DTO re-exports)
├── ui/                    # 4. PRESENTATION (Organized by Feature Slices)
│   ├── feature-a/         # E.g. 'accounts'
│   │   ├── pages/         # Stateful orchestrators
│   │   ├── components/    # Feature-specific components
│   │   └── store/         # Ephemeral feature state
│   └── feature-b/         # E.g. 'journal-entries'
└── routes.ts              # Module-level route registration
```

---

## Pattern 1: High-Integrity SFC (Page Orchestrator)

Pages are the stateful entry points of a module. They compose shared **Engines** (DataGrid) with module-specific **Application Logic** (Composables). List view pages must be Pluralized (e.g. `VendorBillsListPage`).

```vue
<!-- modules/finance/ledger/ui/accounts/pages/ChartOfAccountsListPage.vue -->
<script setup lang="ts">
import { useRouter } from "vue-router";
import { DataGrid, useDataGrid } from "@/shared/components/data-grid";
import { Button } from "@/shared/components/button";
import { useLedgerAccounts } from "../../application/composables/useLedgerAccounts";
import { accountColumns } from "../grids/account.grid";

/**
 * Page: Ledger Accounts List.
 *
 * Orchestrates the Chart of Accounts grid and interaction logic.
 */
const router = useRouter();

// 1. Application Layer (Domain state)
const { accounts, isPending, error } = useLedgerAccounts();

// 2. UI Layer (Local ephemeral grid state)
const { gridState } = useDataGrid();

function handleRowClick(account: any) {
  router.push({ name: "ledger.account-detail", params: { id: account.id } });
}
</script>

<template>
  <div class="p-6 space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Chart of Accounts</h1>
      </div>
      <Button @click="router.push({ name: 'ledger.account-create' })">
        New Account
      </Button>
    </header>

    <DataGrid
      :data="accounts"
      :columns="accountColumns"
      :loading="isPending"
      :state="gridState"
      @row-click="handleRowClick"
    />
  </div>
</template>
```

---

## Pattern 2: Ephemeral UI State (Pinia)

Pinia is strictly for **ephemeral UI state**. **NEVER** duplicate domain data (Server State) in Pinia stores.

```typescript
// modules/finance/ledger/ui/store/ledger-ui.store.ts
import { defineStore } from "pinia";
import { ref } from "vue";

export const useLedgerUIStore = defineStore("ledger-ui", () => {
  const isFilterPanelVisible = ref(false);
  const density = ref<"comfortable" | "compact">("compact");

  function toggleFilters() {
    isFilterPanelVisible.value = !isFilterPanelVisible.value;
  }

  return { isFilterPanelVisible, density, toggleFilters };
});
```

---

## Pattern 3: Application Composable (Use Case)

Composables orchestrate data flow between the **Infrastructure Layer** (Adapters) and the **UI Layer**.
All queries must use `useQuery`, all mutations must use `useApiMutation`.

```typescript
// modules/finance/ledger/application/composables/useLedgerAccounts.ts
import { useResourceQuery } from "@/shared/composables/useResourceQuery";
import { ledgerAdapter } from "../../infrastructure/ledger_adapter";
import { LedgerMapper } from "../../infrastructure/mappers";
import { ledgerKeys } from "../keys";

/**
 * Use Case: View Ledger Accounts.
 *
 * Uses `useResourceQuery` to fetch, map, and cache high-integrity domain models.
 *
 * @returns Reactive accounts state and refetch capability.
 */
export function useLedgerAccounts() {
  const {
    data: accounts,
    isPending,
    error,
    refetch,
  } = useResourceQuery(
    ledgerKeys.accounts(), // queryKey from centralized factories
    () => ledgerAdapter.getAccounts(), // fetch DTOs
    (dtos) => dtos.map((dto) => LedgerMapper.toAccount(dto)), // Mapping logic
    { staleTime: 1000 * 60 * 5 }
  );

  return { accounts, isPending, error, refetch };
}
```

---

## Pattern 4: Infrastructure Layer (Adapter & API Types)

Adapters handle HTTP state and return **raw DTOs**.

```typescript
// modules/finance/ledger/infrastructure/api.types.ts
import type { components } from "@/shared/api/generated.types";
export type AccountDTO = components["schemas"]["AccountRead"];

// modules/finance/ledger/infrastructure/ledger_adapter.ts
import { apiGet } from "@/shared/api/http-client";
import type { AccountDTO } from "./api.types";

/**
 * Ledger API Adapter.
 *
 * Provides typed HTTP methods for interacting with the General Ledger.
 */
export const ledgerAdapter = {
  /**
   * Fetches the Chart of Accounts.
   *
   * @returns A promise resolving to an array of raw AccountDTOs.
   */
  async getAccounts(): Promise<AccountDTO[]> {
    return apiGet<AccountDTO[]>("/finance/ledger/accounts");
  },
};
```

---

## Pattern 5: Domain Mapper & Branded IDs

Mappers transform incoming DTOs into inside **Domain Entities**, safely casting raw ID strings into Branded IDs. **Mappers reside in `infrastructure/mappers.ts`**.

```typescript
// modules/finance/ap/infrastructure/mappers.ts
import { Money } from "@/shared/domain/money";
import { toId } from "@/shared/types/brand.types";
import type { VendorBillId } from "@/shared/types/brand.types";
import type { VendorBillDTO } from "./api.types";

/**
 * Mapper-as-Factory for Accounts Payable.
 *
 * Guards the domain from raw backend DTO shapes.
 */
export class APMapper {
  /**
   * Transforms a raw VendorBillDTO into a Domain Model.
   *
   * @param dto - The raw data from the server.
   * @returns High-integrity VendorBill model.
   */
  static toVendorBill(dto: VendorBillDTO): VendorBill {
    return {
      id: toId<VendorBillId>(dto.id),
      vendorId: dto.vendor_id,
      totalAmount: Money.from(dto.total_amount, dto.currency as Currency),
    };
  }
}
```

---

## Pattern 6: High-Integrity Form (Native Validation)

Forms use **TanStack Form** with **Native Standard Schema** support. We omit intermediary adapters like `zodValidator` for a direct, high-integrity integration.

```typescript
// modules/finance/ap/application/composables/useCreateVendorBill.ts
import { useForm } from "@tanstack/vue-form";
import { z } from "zod";

const vendorBillSchema = z.object({
  vendorId: z.string().min(1, "Vendor required"),
  amount: z.coerce.number().positive(),
});

type FormValues = z.infer<typeof vendorBillSchema>;

/**
 * Use Case: Create Vendor Bill.
 *
 * Manages form state and native Zod validation.
 * Uses an explicit Error Contract: catches Application/API error codes 
 * (e.g., `VENDOR_NOT_FOUND`) and explicitly maps them to localized UI fields
 * to prevent backend schema bleed.
 */
export function useCreateVendorBill() {
  const form = useForm({
    defaultValues: { vendorId: "", amount: 0 } satisfies FormValues,
    validators: {
      onChange: vendorBillSchema, // Native Standard Schema integration
    },
    onSubmit: async ({ value }) => {
      /* Submission logic */
    },
  });

  return { form };
}
```

---

## Pattern 7: Query Key Factories (TanStack Query)

To avoid silent caching failures, **NEVER** use hardcoded string arrays for query invalidation. All query keys MUST be centralized in a `keys.ts` file within the Application layer.

```typescript
// modules/finance/ap/application/keys.ts
export const apKeys = {
  all: ["ap"] as const,
  paymentRequests: () => [...apKeys.all, "payment-requests"] as const,
  paymentRequest: (id: string) => [...apKeys.paymentRequests(), id] as const,
};

// In composables:
void queryClient.invalidateQueries({ queryKey: apKeys.paymentRequests() });
```

---

## Pattern 8: RBAC & Permissions

The frontend natively mirrors backend RBAC guards using `usePermissions`.
Permissions must be bound to route transitions via `meta.permission` in `routes.ts`, and dynamically hide actionable elements using Vue directives like `v-if="hasPermission('ledger:create_entry')"`.

---

## Pattern 9: High-Integrity UI Component Naming

To maintain IDE discoverability and semantic clarity in large ERP domains, UI components must follow strict Action-Suffixed conventions:
- **Pages**: `[Domain][Action]Page.vue` (e.g., `VendorBillsListPage.vue`). Stateful entry points.
- **Forms**: `[Domain][Action]Form.vue` (e.g., `VendorBillCreateForm.vue`). The stateless or purely UI layer for a form.
- **Drawers/Modals**: `[Domain][Action]Drawer.vue` (e.g., `ChartOfAccountsEditDrawer.vue`). Stateful floating orchestrators.

---

## Pattern 10: App Shell Navigation Injection

Modules must define a `menu.ts` file alongside `routes.ts`. This configuration exports the module's desired sidebar navigation structures, tying each path to a Reka UI icon, localized label, and an RBAC `permission`. The central app shell's Sidebar dynamically aggregates these menus to render the exact navigation tree permitted to the user.

---

## Import Aliases

Always use these path aliases:

```typescript
// ✅ Correct imports
import { Money } from "@/shared/domain/money";
import { apiGet } from "@/shared/api/http-client";
import { eventBus } from "@/shared/event-bus/event-bus";

// ✅ Module-internal (relative preferred)
import { useLedgerUIStore } from "../ui/store/ledger-ui.store";

// ❌ BANNED: Cross-module internal imports
import { useLedgerStore } from "@/modules/ledger/ui/store/ledger-ui.store";
```

---

## Unified Toolchain (Vite+ / pnpm)

We use **Vite+** (`vp`) as our single toolchain entry point.

- **`vp install`**: Replaces `npm install`.
- **`vp check`**: Run this to type-check, format, and lint after modifying vue or ts files.
- **`vp dev / vp test / vp build`**: All standard Vite operations.
