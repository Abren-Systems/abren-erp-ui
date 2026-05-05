---
title: 'Form Architecture'
description: 'How forms work in Abren ERP — from the 6-part anatomy down to field validation, submission pipelines, and layout templates.'
tier: frontend
tags: [frontend, architecture, forms, acumatica]
---

# Form Architecture

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Companion:** [Acumatica Alignment §5](ACUMATICA_ALIGNMENT.md#5-form-anatomy-6-basic-parts) — the 6-part form anatomy
> **Companion:** [Screen Runtime](SCREEN_RUNTIME.md) — toolbar rendering, side panel binding
> **Technology:** TanStack Form (headless engine) + Zod (schema validation) + Field System (`AppField`, `AppFieldset`)
> **Last Updated:** May 2026

---

## 1. What a Form Is

In Abren ERP, a **form** is the primary interaction surface. Every financial transaction, configuration change, and approval flows through a form. A form is NOT a standalone `<form>` tag — it is the **entire Working Area content** governed by the [6-part anatomy](ACUMATICA_ALIGNMENT.md#5-form-anatomy-6-basic-parts):

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. FORM TITLE BAR        (rendered by platform — FormTitleBar)  │
├─────────────────────────────────────────────────────────────────┤
│ 2. FORM TOOLBAR           (rendered by platform — FormToolbar)  │
├─────────────────────────────────────────────────────────────────┤
│ 3. SUMMARY AREA           (AppTemplate + AppFieldset groups)    │
├─────────────────────────────────────────────────────────────────┤
│ 4. TABS                   (AppTabs — personalizable)            │
├─────────────────────────────────────────────────────────────────┤
│ 5. DETAILS AREA           (DataGrid, AppFieldset, or Rich Text) │
│    6. ROW                 (line items in grid)                   │
└─────────────────────────────────────────────────────────────────┘
```

Parts 1 and 2 (Title Bar, Toolbar) are **platform chrome** — the screen's `view.vue` never renders them. Parts 3–6 are what `view.vue` provides as pure layout projection from the controller.

### Form Kinds and Their Layout Contracts

Each [Form Kind](ACUMATICA_ALIGNMENT.md#3-form-kinds-what-appears-in-the-working-area) enforces a different layout:

| Kind                   | Summary Zone               | Tabs           | Detail Grid      | Submission Model                |
| ---------------------- | -------------------------- | -------------- | ---------------- | ------------------------------- |
| **Setup** (`10`)       | Settings sections          | Rarely         | No               | Save on change                  |
| **Maintenance** (`20`) | Summary Area (collapsible) | Yes            | No               | Save/Cancel                     |
| **Data Entry** (`30`)  | Summary Area (collapsible) | Yes (multiple) | Yes (line items) | Save/Cancel + workflow commands |
| **Inquiry** (`40`)     | Selection Area (filters)   | No             | Yes (results)    | Read-only — no submission       |
| **Processing** (`50`)  | Selection Area (filters)   | No             | Yes (selectable) | Process / Process All           |

---

## 2. The Authority Model

Forms in Abren are governed by the **Controller Authority** principle (see [Screen Runtime §3](SCREEN_RUNTIME.md#3-controller-authority-the-pxgraph)). The `view.vue` is a pure projection — zero business logic.

```
┌─────────────────────────────────────────────────────────┐
│                  Screen Controller                       │
│                  (controller.ts)                         │
│                                                          │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │ Field Defs   │  │  Commands  │  │  State Machine  │  │
│  │ (fields.ts)  │  │(commands.ts│  │ (UI + Domain)   │  │
│  └──────┬───────┘  └──────┬─────┘  └──────┬──────────┘  │
│         │                 │               │              │
│    useField()        useCommand()    evaluates           │
│    useGrid()                        readonly/visible     │
└────────────────────────┬────────────────────────────────┘
                         │ binds to
                    ┌────▼─────┐
                    │ view.vue │  (pure layout — no logic)
                    └──────────┘
```

### What the Controller Owns

| Responsibility                                                           | Where It Lives                  | NOT In                 |
| ------------------------------------------------------------------------ | ------------------------------- | ---------------------- |
| Field definitions (label, type, readonly, required)                      | `fields.ts`                     | Template               |
| Commands (submit, approve, void)                                         | `commands.ts`                   | Template buttons       |
| State evaluation (which fields are editable, which commands are visible) | `controller.ts`                 | `v-if` in template     |
| Data fetching & mutation                                                 | `controller.ts` via composables | Component `onMounted`  |
| Validation schema                                                        | `fields.ts` or `controller.ts`  | Inline template checks |

### What the View Owns

| Responsibility   | How                                                   |
| ---------------- | ----------------------------------------------------- |
| Layout structure | `AppTemplate`, `AppFieldset`, `AppTabs`               |
| Field rendering  | `<AppField v-bind="controller.useField('vendor')" />` |
| Grid rendering   | `<DataGrid v-bind="controller.useGrid('lines')" />`   |
| Nothing else     | —                                                     |

---

## 3. The Field System (Editable Fields)

Fields are the atomic unit of form interaction. Every field is declared in `fields.ts` and bound via the controller — never created ad-hoc in the template.

### 3.1 Field Definition

```typescript
// AP301000/fields.ts
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
  amount: {
    key: 'amount',
    labelKey: 'ap.AP301000.summary.amount',
    controlType: 'currency',
    layoutHints: { tabularNums: true },
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

### 3.2 Field Binding in View

```vue
<!-- WRONG: Raw field with inline logic -->
<div class="space-y-2">
  <Label for="vendor">Vendor</Label>
  <Input
    id="vendor"
    :model-value="data.vendor"
    @update:model-value="(v) => data.vendor = v"
    :disabled="data.status !== 'DRAFT'"
  />
</div>

<!-- RIGHT: Field bound via controller — zero logic in template -->
<AppField v-bind="controller.useField('vendor')" />
```

The `useField()` binding returns everything the `AppField` component needs:

- `value` — current reactive value
- `onChange` — mutation handler (goes through controller's mutation guard)
- `readonly` — evaluated from `FieldDefinition.state.readonly` against current state machine
- `required` — evaluated from `FieldDefinition.state.required`
- `label` — resolved from `labelKey`
- `controlType` — determines which input primitive renders
- `errors` — validation errors from the schema

---

## 4. Validation Architecture

### 4.1 Validation Engine

TanStack Form + Zod is the validation engine. Zod schemas define rules as pure data — no imperative `if/else` in templates.

### 4.2 Schema Location

Validation schemas live **in the screen's field system**, not in standalone files:

| Location             | What                                                           | Why                                      |
| -------------------- | -------------------------------------------------------------- | ---------------------------------------- |
| `fields.ts`          | Field-level rules (required, min/max, format)                  | Co-located with field definitions        |
| `controller.ts`      | Cross-field rules (total must balance, date range)             | Controller has access to full form state |
| `shared/validation/` | Reusable validators (ISO date, positive amount, currency code) | Cross-cutting concerns                   |

### 4.3 Shared Validators

```typescript
// shared/validation/validators.ts
import { z } from 'zod'

export const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
export const positiveAmount = z.number().positive('Must be a positive amount')
export const currencyCode = z.string().length(3, 'Must be a valid ISO 4217 currency code')
```

### 4.4 Validation Triggers

| Trigger       | Use Case                                   | Configuration                 |
| ------------- | ------------------------------------------ | ----------------------------- |
| **On Change** | Real-time feedback for simple fields       | Field-level schema validation |
| **On Blur**   | Deferred validation for expensive checks   | Field-level onBlur handler    |
| **On Submit** | Final gate before mutation (always active) | Controller-level form schema  |

### 4.5 Error Display Rules

1. **Field-level errors** — Rendered by `AppField` directly below the input (part of the field contract).
2. **Form-level errors** — Displayed by the controller in the Summary Area (e.g., "Debit and Credit totals must balance").
3. **Server errors** — Returned from the mutation and displayed via the global toast system.

---

## 5. Submission Pipeline

Submission is a **multi-stage pipeline** managed entirely by the controller. The view never calls API endpoints.

```
User clicks Save (toolbar) or Expected Next Action (e.g., Submit)
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ 1. VALIDATE        Controller runs Zod schema           │
│                    against current form state            │
├─────────────────────────────────────────────────────────┤
│ 2. TRANSFORM       Mapper converts UI values → DTO      │
│                    (branded IDs, Money → raw numbers)    │
├─────────────────────────────────────────────────────────┤
│ 3. MUTATE          TanStack Mutation via adapter         │
│                    (Idempotency-Key attached by client)  │
├─────────────────────────────────────────────────────────┤
│ 4. HANDLE RESULT   Success: invalidate queries, nav     │
│                    Failure: show server errors           │
└─────────────────────────────────────────────────────────┘
```

### Save vs. Workflow Commands

| Action      | Type                             | Pipeline                                                               | Who Calls It                           |
| ----------- | -------------------------------- | ---------------------------------------------------------------------- | -------------------------------------- |
| **Save**    | Standard toolbar button          | Validate → Transform → `adapter.update()` → Invalidate                 | Platform toolbar                       |
| **Submit**  | Workflow command (Expected Next) | Validate → Transform → `adapter.submit()` → Invalidate + status change | Controller via `ScreenCommand.execute` |
| **Approve** | Workflow command                 | No form validation needed → `adapter.approve()` → Invalidate           | Controller via `ScreenCommand.execute` |
| **Void**    | Workflow command                 | Confirmation dialog → `adapter.void()` → Invalidate + nav              | Controller via `ScreenCommand.execute` |

### Submission in the Controller

```typescript
// AP301000/controller.ts (submission handling)
const saveMutation = useMutation({
  mutationFn: async () => {
    // 1. Validate
    const valid = await controller.validateForm()
    if (!valid) return

    // 2. Transform
    const dto = APMapper.toUpdateDTO(controller.getFormValues())

    // 3. Mutate
    return paymentRequestAdapter.update(currentId.value, dto)
  },
  onSuccess: () => {
    // 4. Handle result
    queryClient.invalidateQueries({ queryKey: ['ap', 'payment-requests'] })
    controller.transitionUIState('VIEW')
  },
})
```

---

## 6. Form Layout

### 6.1 Summary Area Layout (AppTemplate)

The Summary Area uses named templates from the [Layout Template System](ACUMATICA_ALIGNMENT.md#11-layout-template-system):

```vue
<!-- Data Entry form with 3-column summary: ID | Details | Totals -->
<AppTemplate template="7-10-7">
  <template #slot-1>
    <AppFieldset title="Document">
      <AppField v-bind="controller.useField('referenceNumber')" />
      <AppField v-bind="controller.useField('status')" />
      <AppField v-bind="controller.useField('date')" />
    </AppFieldset>
  </template>

  <template #slot-2>
    <AppFieldset title="Vendor">
      <AppField v-bind="controller.useField('vendor')" />
      <AppField v-bind="controller.useField('location')" />
    </AppFieldset>
  </template>

  <template #slot-3>
    <AppFieldset title="Totals">
      <AppField v-bind="controller.useField('lineTotal')" />
      <AppField v-bind="controller.useField('taxTotal')" />
      <AppField v-bind="controller.useField('orderTotal')" />
    </AppFieldset>
  </template>
</AppTemplate>
```

### 6.2 Detail Area Layout (Tabs + Grid)

```vue
<AppTabs>
  <AppTab label="Document Details">
    <!-- Tab-level toolbar for grid actions -->
    <DataGrid v-bind="controller.useGrid('lines')">
      <!-- Grid columns defined in grid definition, not here -->
    </DataGrid>
  </AppTab>

  <AppTab label="Financial">
    <AppFieldset title="Payment Details">
      <AppField v-bind="controller.useField('paymentMethod')" />
      <AppField v-bind="controller.useField('bankAccount')" />
    </AppFieldset>
  </AppTab>

  <AppTab label="Approvals">
    <DataGrid v-bind="controller.useGrid('approvalHistory')" />
  </AppTab>
</AppTabs>
```

### 6.3 Layout Per Form Kind

| Kind            | Summary Template             | Typical Structure                          |
| --------------- | ---------------------------- | ------------------------------------------ |
| **Setup**       | `1` (full width)             | Settings sections, no tabs                 |
| **Maintenance** | `1-1` (50/50)                | Two-column fieldsets, tabs for details     |
| **Data Entry**  | `7-10-7` (ID/details/totals) | 3-column summary + tabs with grids         |
| **Inquiry**     | N/A                          | Selection Area (filters) + full-width grid |

---

## 7. Line Item Editing (Detail Grid Forms)

Data Entry forms (area code `30`) typically include editable line item grids. These follow the same controller authority model:

### 7.1 Grid as Controller Projection

```typescript
// The grid is a projection of the controller's data graph
// Lines are NOT fetched independently — they come from the controller's detail view
controller.useGrid('lines') // → returns reactive column defs, data, toolbar config
```

### 7.2 Line Item Operations

| Operation   | How                       | Controller Method                                 |
| ----------- | ------------------------- | ------------------------------------------------- |
| Add line    | Grid toolbar `[+]` button | `controller.addLine()`                            |
| Delete line | Grid toolbar `[×]` button | `controller.deleteLine(index)`                    |
| Edit cell   | Inline cell editing       | `controller.updateLineField(index, field, value)` |
| Reorder     | Drag or move buttons      | `controller.reorderLine(from, to)`                |

### 7.3 Cross-Field Validation (Header ↔ Lines)

```typescript
// Controller validates that lines total matches header
controller.registerCrossValidation(() => {
  const headerTotal = controller.getFieldValue('orderTotal')
  const linesTotal = controller.getGridData('lines').reduce((sum, line) => sum + line.amount, 0)

  if (Math.abs(headerTotal - linesTotal) > 0.01) {
    return { field: 'orderTotal', error: 'Header total must match line items' }
  }
  return null
})
```

---

## 8. Rules (Non-Negotiable)

1. **No `v-model` directly on API data.** Forms work on controller-managed state.
2. **No validation logic in templates.** All rules live in Zod schemas or field definitions.
3. **No direct API calls from views.** Submission goes through the controller's mutation pipeline.
4. **No raw `<form.Field>` in production views.** Use `<AppField v-bind="controller.useField(key)" />`.
5. **No toolbar or command buttons in `view.vue`.** Toolbar is rendered by platform chrome from `commands.ts`.
6. **All financial amount inputs must enforce `step="0.01"`** and display with `tabular-nums` (via `controlType: 'currency'`).
7. **Reset forms on successful Save** via controller state transition, not manual ref clearing.
8. **Form schemas must be symmetric with backend DTOs** — the mapper is the only translation layer.
