---
title: Field System Architecture
tier: 1
tags: [architecture, field-system, ui, constraints]
---

# Field System Architecture

> **Version:** 1.0
> **Status:** AUTHORITATIVE — Phase 3 (Deterministic Runtime)
> **Last Updated:** May 2026

## Why This Exists

> This system exists to enable a deterministic, metadata-driven UI runtime where screens are pure projections.

The Abren ERP frontend follows the **"Constrain early, abstract late"** strategy. We enforce a small set of structural primitives governed by the **Four Layers of Authority** (Platform, Semantic Kernel, Business Modules, Projections).

These primitives are designed so that:

1. **Phase 1**: Screens used `<AppField>` and `<AppFieldset>` with hand-written templates.
2. **Phase 2**: Editable field variants were added; forms integrated with the system.
3. **Phase 3** (Current): The **Screen Runtime** is active. Screens are declared as `ScreenDefinition` metadata, resolved by a **Semantic Compiler**, and rendered as a pure `ScreenModel` projection. No screen rewrite is needed because the component contracts are already correct.

This is the same architectural trajectory taken by Acumatica's Modern UI, SAP Fiori, and Oracle APEX — but implemented incrementally.

---

## Design Philosophy

### UI is a Projection of Domain State

The frontend is a **thin client**. All business logic, validation, state transitions, and authorization live on the server. The UI's only responsibilities are:

- **Render** — display data from the API
- **Collect** — send user input to the API
- **Map** — transform DTOs into UI-friendly domain models (via Mappers)
- **Navigate** — open or focus the correct screen based on API responses

Components are **renderers**, not decision-makers.

### Configuration Over Code

Field presentation (formatting, alignment, emphasis, empty states) is defined in a central **Field Registry**, not scattered across templates. This ensures consistency across all screens and all modules.

### One Way to Do Things

There is exactly **one** field system, **one** layout system, and **one** data binding pattern. Multiple approaches guarantee entropy.

---

## Core Primitives

### `<AppField>`

The **only** way to display a data field in a business screen.

```vue
<AppField
  field="totalAmount"
  label="Total Amount"
  :value="request.totalAmount"
  type="money"
  :context="{ entity: 'PaymentRequest' }"
/>
```

#### Props

| Prop      | Type                   | Required | Description                                                      |
| :-------- | :--------------------- | :------- | :--------------------------------------------------------------- |
| `field`   | `string`               | ✅       | Stable identity key. Used for schema, personalization, testing.  |
| `label`   | `string`               | ✅       | Display text. UI concern only, overridable, translatable.        |
| `value`   | `unknown`              | ✅       | Raw domain value. **Must not be pre-formatted.**                 |
| `type`    | `FieldType`            | ✅       | Registry key: `text`, `money`, `status`, `date`, `id`, `number`. |
| `context` | `FieldContext`         | ❌       | Optional rendering hints (entity name, field name).              |
| `size`    | `'sm' \| 'md' \| 'lg'` | ❌       | Label/value density. Defaults to `md`.                           |

#### Responsibility Boundary

`AppField` must **only**:

1. Receive a value
2. Ask the registry how to display it
3. Render its standard internal DOM (`div.app-field > span.app-field__label + span.app-field__value`).

It must **never**:

- Decide its own layout (`layout="horizontal"` is banned here).
- Flatten its DOM via `display: contents` (breaks accessibility and editing).
- Interpret business rules, decide visibility, or mutate values.

---

### `<AppFieldset>` (The Layout Engine)

The **only** permitted layout authority in a business screen.

```vue
<AppFieldset title="Payment Summary" variant="ghost" layout="horizontal" :columns="3">
  <!-- fields... -->
</AppFieldset>
```

#### Props

| Prop          | Type                                            | Required | Description                                               |
| :------------ | :---------------------------------------------- | :------- | :-------------------------------------------------------- |
| `title`       | `string`                                        | ❌       | Section heading. Optional for ghost fieldsets.            |
| `variant`     | `'primary' \| 'neutral' \| 'accent' \| 'ghost'` | ❌       | Color-coded header. `ghost` removes borders/background.   |
| `layout`      | `'horizontal' \| 'vertical'`                    | ❌       | Enforces label alignment logic. Defaults to `vertical`.   |
| `columns`     | `1 \| 2 \| 3`                                   | ❌       | Internal grid columns. Defaults to `2`. **Maximum is 3.** |
| `collapsible` | `boolean`                                       | ❌       | Enables expand/collapse.                                  |

#### The CSS Grid Contract

When `layout="horizontal"`, the Fieldset acts as an overarching layout engine. It forces a strict `140px` baseline label width on all descendant `.app-field` elements via CSS Grid, ensuring perfectly aligned Acumatica-style density without mutating the `AppField`'s internal structure.

---

### `<FieldGroup>`

Lightweight, **purely semantic** sub-grouping within a fieldset. It has absolutely no layout properties of its own. It simply groups elements (e.g., stacking 3 fields together inside one column of a 3-column Fieldset).

```vue
<AppFieldset variant="ghost" layout="horizontal" :columns="3">
  <FieldGroup>
    <AppField field="requester" label="Requester" :value="email" type="id" />
    <AppField field="status" label="Status" :value="status" type="status" />
  </FieldGroup>
</AppFieldset>
```

---

### `<AppTabs>`

A stateless, **purely visual visibility toggle** used to separate data strata (e.g., Summary vs. Lines vs. Audit).

#### Constraints

Tabs **must not**:

- Trigger async data fetching.
- Control routing.
- Act as lifecycle boundaries.
  They simply toggle visibility over already-loaded data.

---

### `<DataGrid>`

The **only** permitted tabular rendering system.

#### Constraints

When used in a Focus screen, it must operate as a dumb rendering shell over structured rows.

- No custom column rendering logic per screen.
- No inline business formatting (must use shared generic cells like `MoneyCell`).

---

## Field Registry

### Type Definitions

```typescript
type FieldType = 'text' | 'money' | 'status' | 'date' | 'id' | 'number'

type FieldAlign = 'left' | 'right'
type FieldEmphasis = 'normal' | 'strong' | 'muted'

type FieldContext = {
  entity?: string // e.g., "PaymentRequest", "VendorBill"
  field?: string // e.g., "status", "totalAmount"
}

interface FieldDefinition {
  format: (value: unknown, ctx?: FieldContext) => string
  align: FieldAlign
  emphasis: FieldEmphasis
  empty?: (value: unknown) => boolean
  emptyDisplay?: string // defaults to "—"
  variant?: (value: unknown, ctx?: FieldContext) => string
}
```

### Built-In Types

| Type     | Format                          | Align | Emphasis | Empty Display |
| :------- | :------------------------------ | :---- | :------- | :------------ |
| `text`   | `String(value)`                 | left  | normal   | `—`           |
| `money`  | `Money.format('en-ET')`         | right | strong   | `—`           |
| `status` | `String(value)` + badge variant | left  | normal   | `—`           |
| `date`   | Locale date string              | left  | normal   | `—`           |
| `id`     | `String(value)`                 | left  | muted    | `—`           |
| `number` | `toLocaleString()`              | right | normal   | `—`           |

### Extension Guide

To add a new field type (e.g., `percentage`):

1. Add it to the `FieldType` union in `registry.ts`.
2. Register its `FieldDefinition` in the definitions map.
3. No other files need to change — `<AppField>` resolves automatically.

---

## Action Contract

### `ScreenAction` Interface

```typescript
interface ScreenAction {
  key: string // stable identity (e.g., 'approve')
  label: string // display text
  variant: 'primary' | 'danger' | 'neutral'
  enabled: boolean
  requiresConfirmation?: boolean // gates destructive actions with a dialog
}
```

Components receive `ScreenAction[]` and render buttons. They do not decide which actions to show — that decision comes from the server or the domain type's state machine.

---

## Enforced Constraints

> **These rules apply to ALL business screens. Violations must be corrected immediately.**

### 1. No raw layout

`<div class="grid">` in a business screen is a violation. Use `<AppFieldset>` or `<FieldGroup>`.

### 2. No raw data display

`<span>{{ amount }}</span>` is a violation. Use `<AppField>`.

### 3. No business logic in components

If a component checks `if (status === 'APPROVED')`, that decision must come from the domain type or the server. The component only renders.

### 4. One field system

All field rendering goes through the registry. No one-off formatters in templates.

### 5. field/label separation

Every `<AppField>` must have a stable `field` key distinct from its `label`.

### 6. No conditional field rendering

No `v-if` on `<AppField>` based on business state. Null values render as `"—"`. Visibility decisions belong in data/metadata, not templates.

### 7. Generic types only

Never create `money_etb` or `status_pr`. Types are generic; behavior is contextual via `FieldContext`.

### 8. AppField is a renderer

It must not interpret business rules, decide visibility, or mutate values.

### 9. Value purity

Values passed to `<AppField>` must be raw domain values. No pre-formatting (`formatMoney(x)`). The registry handles all presentation.

### 10. FieldContext is rendering-only

Allowed: `entity`, `field`. Not allowed: permissions, workflow state, user roles, or any business logic inputs.

### 11. Empty state semantics

`null`, `0`, `""`, and `[]` are not interchangeable. The registry defines per-type emptiness via `empty()` and `emptyDisplay`.

---

## Phase Roadmap

| Phase         | Scope                   | Key Deliverable                                   | Status      |
| :------------ | :---------------------- | :------------------------------------------------ | :---------- |
| **Phase 1**   | Read-only field display | `AppField`, `AppFieldset`, `FieldGroup`, Registry | ✅ Complete |
| **Phase 1.5** | Layout & Density        | CSS Grid System, `AppTabs`, Acumatica Alignment   | ✅ Complete |
| **Phase 2**   | Editable fields + forms | `AppField` gains `mode="edit"`, form integration  | ✅ Complete |
| **Phase 3**   | Metadata-driven screens | `ScreenDefinition` schema + `ScreenModel` runtime | ✅ Active   |
| **Phase 4**   | Personalization         | User-driven field show/hide/reorder               | 📋 Backlog  |
