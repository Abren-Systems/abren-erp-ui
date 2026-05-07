---
title: 'Screen Migration Guide'
description: 'Step-by-step process for converting legacy pages to the canonical Screen ID architecture.'
tier: frontend
tags: [frontend, migration, screen-runtime, acumatica]
---

# Screen Migration Guide

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Companion:** [Acumatica Alignment](ACUMATICA_ALIGNMENT.md) — the mental model backing this guide
> **Canonical Example:** `AP301000` (Payment Request Entry)
> **Last Updated:** May 2026

This guide codifies the exact process for converting a legacy `pages/components/` screen to the canonical Screen ID architecture. Every new form and every migrated form MUST follow this process.

---

## 1. Pre-Migration Checklist

Before touching code, answer these questions:

| #   | Question                                     | How to Answer                                                                                                                                               |
| --- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | What **Form Kind** is this?                  | See [Acumatica Alignment §3](ACUMATICA_ALIGNMENT.md#3-form-kinds-what-appears-in-the-working-area) — Setup/Maintenance/Data Entry/Inquiry/Processing/Report |
| 2   | What **Screen ID** should it get?            | Module prefix + area code + sequence. See [§4](ACUMATICA_ALIGNMENT.md#4-the-screen-id-system)                                                               |
| 3   | Does it need a **PL (Primary List)** pair?   | Data Entry forms → YES, create both `XX301000` and `XX3010PL`                                                                                               |
| 4   | What is the **Primary View**?                | The main record/entity the form manages                                                                                                                     |
| 5   | What **commands** does it need?              | Standard buttons per kind + domain-specific actions                                                                                                         |
| 6   | What **Summary Area template** does it need? | `1-1-1`, `7-10-7`, etc. See [§11](ACUMATICA_ALIGNMENT.md#11-layout-template-system)                                                                         |

---

## 2. Target File Structure

Every screen lives in a folder named by its Screen ID:

```
src/modules/{area}/{module}/ui/
├── {ScreenId}/                    # e.g., AP301000/
│   ├── screen.ts                  # ScreenDefinition metadata
│   ├── controller.ts              # Controller (PXGraph equivalent)
│   ├── commands.ts                # ScreenCommand declarations
│   ├── fields.ts                  # FieldDefinition declarations
│   ├── view.vue                   # Pure layout (no business logic)
│   └── components/                # Screen-specific sub-components (if needed)
│       └── PaymentRequestLines.vue
├── {ScreenId}PL/                  # e.g., AP3010PL/ (paired inquiry)
│   ├── screen.ts
│   ├── controller.ts
│   ├── commands.ts
│   ├── fields.ts
│   └── view.vue
└── screens.ts                     # Module screen registry
```

---

## 3. Migration Steps

### Step 1: Create `screen.ts` (ScreenDefinition)

This is the metadata file — the equivalent of Acumatica's screen registration.

```typescript
import type { ScreenDefinition } from '@/platform/screen-runtime/screen-definition.types'

export const AP301000: ScreenDefinition = {
  screenId: 'AP301000' as ScreenId,
  title: 'Payment Request Entry',
  kind: 'dataEntry', // From pre-migration Q1
  module: 'ap',

  layout: {
    summaryTemplate: '7-10-7', // From pre-migration Q6
  },

  views: {
    paymentRequest: {
      // Primary View (from Q4)
      name: 'paymentRequest',
      kind: 'single',
      containerName: 'PaymentRequestEntry',
      queryKey: ['ap', 'payment-requests', 'detail'],
    },
    lines: {
      // Detail View (if data entry)
      name: 'lines',
      kind: 'collection',
      containerName: 'PaymentRequestLines',
      queryKey: ['ap', 'payment-requests', 'lines'],
    },
  },

  permissions: {
    view: 'ap:payment-requests:view',
    create: 'ap:payment-requests:create',
    edit: 'ap:payment-requests:edit',
    delete: 'ap:payment-requests:delete',
  },
}
```

### Step 2: Create `fields.ts` (Field Definitions)

Declare every field the form displays. Fields enforce behavioral discipline via the controller.

```typescript
import type { FieldDefinition } from '@/platform/field-system/field-definition.types'

export const paymentRequestFields: Record<string, FieldDefinition> = {
  referenceNumber: {
    key: 'referenceNumber',
    labelKey: 'ap.AP301000.summary.referenceNumber',
    controlType: 'text',
    state: {
      readonly: (state) => state.domainStatus !== 'DRAFT',
    },
  },
  vendor: {
    key: 'vendor',
    labelKey: 'ap.AP301000.summary.vendor',
    controlType: 'selector',
    state: {
      required: true,
      readonly: (state) => state.domainStatus !== 'DRAFT',
    },
  },
  status: {
    key: 'status',
    labelKey: 'ap.AP301000.summary.status',
    controlType: 'badge',
    state: {
      readonly: () => true, // Always read-only — set by workflow
    },
  },
}
```

### Step 3: Create `commands.ts` (Command Declarations)

Declare commands as **flat data objects** following the [two-layer hybrid model](ACUMATICA_ALIGNMENT.md#6-the-command-model-two-layer-hybrid):

```typescript
import type { ScreenCommand } from '@/platform/commands/command.types'

export const paymentRequestCommands: ScreenCommand[] = [
  {
    key: 'submit',
    labelKey: 'ap.AP301000.actions.submit',
    icon: 'send',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
    favoriteEligible: false,
    isVisible: (state) => state.domainStatus === 'DRAFT',
    isEnabled: (state, data) => !!data.vendorId && data.lines?.length > 0,
    expectedNext: (state) => state.domainStatus === 'DRAFT',
    execute: (controller) => controller.executeAction('submit'),
  },
  {
    key: 'approve',
    labelKey: 'ap.AP301000.actions.approve',
    icon: 'check-circle',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
    favoriteEligible: false,
    isVisible: (state) => state.domainStatus === 'SUBMITTED',
    isEnabled: () => true,
    expectedNext: (state) => state.domainStatus === 'SUBMITTED',
    execute: (controller) => controller.executeAction('approve'),
  },
  {
    key: 'void',
    labelKey: 'ap.AP301000.actions.void',
    icon: 'x-circle',
    categoryKey: 'processing',
    displayOnMainToolbar: false, // Only in More Menu
    favoriteEligible: false,
    isVisible: (state) => ['APPROVED', 'AUTHORIZED'].includes(state.domainStatus),
    isEnabled: () => true,
    expectedNext: () => false,
    execute: (controller) => controller.executeAction('void'),
  },
]
```

### Step 4: Create `controller.ts` (The PXGraph)

The controller is the single source of truth. It owns data, commands, and state.

```typescript
import { useScreenController } from '@/platform/screen-runtime/useScreenController'
import { AP301000 } from './screen'
import { paymentRequestFields } from './fields'
import { paymentRequestCommands } from './commands'

export function usePaymentRequestEntry(id: string) {
  const controller = useScreenController(AP301000)

  // Register fields
  controller.registerFields(paymentRequestFields)

  // Register commands
  paymentRequestCommands.forEach((cmd) => controller.registerCommand(cmd))

  // Data loading via module infrastructure
  const { data, isLoading } = usePaymentRequestQuery(id)
  controller.bindPrimaryView(data)

  // State machine bindings
  controller.bindDomainStatus(() => data.value?.status)

  return controller
}
```

### Step 5: Create `view.vue` (Pure Layout)

The view is a **pure projection** of the `ScreenModel`. It has zero business logic and zero knowledge of the controller's implementation details. It simply renders the deterministic execution contract produced by the platform's resolution engine.

```vue
<script setup lang="ts">
import { usePaymentRequestEntry } from './controller'
import { useRoute } from 'vue-router'

const route = useRoute()
const controller = usePaymentRequestEntry(route.params.id as string)
</script>

<template>
  <!-- Summary Area fields (bound via controller) -->
  <AppFieldset title="Document">
    <AppField v-bind="controller.useField('referenceNumber')" />
    <AppField v-bind="controller.useField('status')" />
  </AppFieldset>

  <AppFieldset title="Vendor">
    <AppField v-bind="controller.useField('vendor')" />
  </AppFieldset>

  <!-- Tabs + Detail Area -->
  <AppTabs>
    <AppTab label="Document Details">
      <DataGrid v-bind="controller.useGrid('lines')" />
    </AppTab>
    <AppTab label="Financial">
      <!-- Financial details -->
    </AppTab>
  </AppTabs>
</template>
```

> **Note:** The view does NOT render the Title Bar, Toolbar, or Side Panel. Those are rendered by the ScreenRenderer (platform chrome) automatically based on `screen.ts` and `controller.ts`.

### Step 6: Register in `screens.ts`

```typescript
import { AP301000 } from './AP301000/screen'
import { AP3010PL } from './AP3010PL/screen'

export const apScreens = [AP301000, AP3010PL]
```

### Step 7: Register routes

Add the screen's route to the module's router configuration, pointing to the `view.vue`.

---

## 4. Legacy Pattern → New Pattern Cheat Sheet

| Legacy Pattern                                   | New Pattern                                                                       | Why                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `pages/VendorBillFocus.vue` (600+ line monolith) | `AP302000/view.vue` (pure layout) + `controller.ts` + `commands.ts` + `fields.ts` | Separation of concerns; controller is testable without DOM |
| Inline toolbar buttons in template               | `commands.ts` data objects                                                        | Platform renders toolbar automatically                     |
| `v-if="status === 'DRAFT'"` in template          | `isVisible: (state) => state.domainStatus === 'DRAFT'` in command                 | Logic lives in controller, not in view                     |
| Direct API calls in component                    | Controller calls via module adapter/composable                                    | Clean Architecture boundary                                |
| `defineProps` for data passing                   | `controller.useField('key')` binding                                              | State machine governs field behavior                       |
| Ad-hoc CSS grid for summary                      | `summaryTemplate: '7-10-7'` in `screen.ts`                                        | Consistent across all forms                                |
| Hand-coded tabs                                  | `AppTabs` + `AppTab` from screen definition                                       | Personalizable, consistent                                 |

---

## 5. Migration Priority

| Priority | Screen                | Legacy Location                          | Target ID  | Form Kind   |
| -------- | --------------------- | ---------------------------------------- | ---------- | ----------- |
| ✅ Done  | Payment Request Entry | `AP301000/`                              | `AP301000` | Data Entry  |
| ✅ Done  | Payment Requests List | `AP3010PL/`                              | `AP3010PL` | Inquiry     |
| P1       | Vendor Bill Entry     | `vendor-bills/pages/VendorBillFocus.vue` | `AP302000` | Data Entry  |
| P1       | Journal Entry         | (ledger legacy)                          | `GL301000` | Data Entry  |
| P1       | Chart of Accounts     | (ledger legacy)                          | `GL201000` | Maintenance |
| P2       | Bank Accounts         | (bank legacy)                            | `CA202000` | Maintenance |
| P2       | Tax Preferences       | (tax legacy)                             | `TX101000` | Setup       |
| P2       | Stock Items           | (inventory legacy)                       | `IN202000` | Maintenance |
| P2       | Inventory Adjustments | (inventory legacy)                       | `IN301000` | Data Entry  |

---

## 6. Validation Checklist

After migration, verify:

- [ ] `screen.ts` has correct `kind`, `screenId`, `views`, `permissions`
- [ ] `fields.ts` uses i18n keys in format `{module}.{screenId}.{section}.{key}`
- [ ] `commands.ts` uses declarative data objects with `categoryKey`, `expectedNext`, `isVisible`, `isEnabled`
- [ ] `controller.ts` owns all data access, command registration, and state machine
- [ ] `view.vue` contains zero business logic — only `v-bind` to controller bindings
- [ ] `view.vue` does NOT render Title Bar, Toolbar, or Side Panel (platform chrome does)
- [ ] Screen is registered in module's `screens.ts`
- [ ] Route is configured pointing to `view.vue`
- [ ] No cross-module imports (only via module contracts)
