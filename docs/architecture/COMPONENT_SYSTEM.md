---
title: 'Component System & Contracts'
description: 'Authoritative guide for component ownership, layers, and formal contracts for Acumatica-style ERP components.'
tier: frontend
tags: [frontend, components, design-system, acumatica]
---

# Component System & Contracts

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Companion:** [Acumatica Alignment](ACUMATICA_ALIGNMENT.md) — maps components to Acumatica's form anatomy (§5)
> **Last Updated:** May 2026

This document defines how UI components are built, consumed, and governed in Abren ERP. It ensures that the product identity remains Abren-owned while leveraging headless infrastructure for behavior.

---

## 1. Core Principles

### 1.1 Ownership First

Business modules must consume **Abren-owned shared components**, not raw vendor primitives.

- Use Abren-owned primitives and ERP components from `src/shared/ui/` as the target structure.
- During migration, compatibility exports from `src/shared/components/` are acceptable.
- The product contract belongs to Abren, not to any vendor library.

### 1.2 Headless Direction

Abren’s long-term direction is **headless accessibility and behavior** paired with **Abren-owned appearance and composition**.

- The preferred behavior layer is **Reka UI / Radix-Vue lineage primitives**.
- These primitives must remain invisible at the product-language level. Users experience Abren, not a library.

### 1.3 No Fluent Reintroduction

The old Fluent-based wrapper layer is historical context, not an active foundation.

- Do not reintroduce raw `<fluent-*>` tags.
- Do not build product doctrine around Fluent tokens or appearance.

---

## 2. Component Layers

### 2.1 Primitive Layer

Atomic interactions built via Abren-owned headless composition:

| Component | Purpose | Status |
|-----------|---------|--------|
| `AppButton` | Clickable actions | ✅ Built |
| `AppInput` | Text/number input | ✅ Built |
| `AppSelect` | Dropdown selection | ✅ Built |
| `AppBadge` | Status indicators | ✅ Built |
| `AppDrawer` | Slide-out panels | ✅ Built |
| `AppDialog` | Modal dialogs | ✅ Built |
| `AppSidePane` | Contextual overlays (filter/trace) | ✅ Built |

### 2.2 Screen Layer (Platform Chrome)

Repeatable screen structure compositions that implement [Acumatica Form Anatomy](ACUMATICA_ALIGNMENT.md#5-form-anatomy-6-basic-parts):

| Component | Acumatica Part | Purpose | Status |
|-----------|---------------|---------|--------|
| `FormTitleBar` | Part 1: Form Title Bar | Form title, record title, record service buttons | ❌ Not built |
| `FormToolbar` | Part 2: Form Toolbar | Standard buttons + Expected Next + More Menu | ❌ Not built |
| `MoreMenu` | Part 2: More Menu | Categorized commands, favorites, expected next indicator | ❌ Not built |
| `RecordServicesMenu` | Part 1: Title Bar buttons | Notes, Files, Activities, Settings | ❌ Not built |
| `WorkspacePanel` | Workspace overlay | Categorized links to forms/reports/dashboards | ❌ Not built |
| `EmptyState` | — | Empty record/list placeholder | ✅ Built |

### 2.3 Field System Layer (Working Area)

Governs all data display and layout inside the Working Area. See [Field System Architecture](../FIELD_SYSTEM.md).

| Component | Acumatica Part | Purpose | Status |
|-----------|---------------|---------|--------|
| `AppField` | `PXField` | Semantic data renderer via Field System | ✅ Built |
| `AppFieldset` | `qp-fieldset` | CSS Grid layout authority (140px baseline) | ✅ Built |
| `AppTemplate` | `qp-template` | Named screen template for Acumatica-style slot widths | ❌ Not built |
| `AppTabs` | Part 4: Tabs | Personalizable visibility toggle for data strata | ✅ Built |
| `DataGrid` | Part 5/6: Details/Row | Tabular rendering with preset-driven logic | ✅ Built |

---

## 3. Component Contract Registry

Acumatica-style components are not free-form widgets. They carry naming conventions, caption rules, layout rules, and personalization behavior.

### 3.1 Contract Type

```ts
interface ComponentContract {
  type: string
  idPrefix: string
  labelConvention: 'verb' | 'nounPhrase' | 'question' | 'none'
  allowedIn: readonly string[]
  configSchema: unknown
  personalization: readonly ComponentPersonalizationCapability[]
  testRole: string
}
```

### 3.2 Required Contracts

| Component            | ID Pattern       | Label Rule    | Key Rules                                                      |
| -------------------- | ---------------- | ------------- | -------------------------------------------------------------- |
| Button               | `button*`        | Verb phrase   | Comes from command metadata; More menu by default.             |
| Dialog               | `dialog*`        | Question/task | Standard sizes, footer commands, validation contract.          |
| Fieldset             | `fs*`            | Noun phrase   | Used for sections; no arbitrary business grid layouts.         |
| Template             | `template*`      | None          | Named Acumatica-like templates control slots/widths.           |
| Tab container        | `tabs*`          | None          | Personalizable; no single-tab screens.                         |
| Tab                  | `tab*`           | Noun phrase   | Standard names where applicable: General, Details, Taxes, etc. |
| Grid                 | `grid*`          | Noun phrase   | Requires preset, column contract, toolbar/filter policy.       |
| Selector             | `selector*`      | Noun phrase   | Lookup display, link command, parameters, access filtering.    |
| Record services menu | `recordServices` | None          | Notes, files, activities, audit, link, notifications.          |
| More menu            | `moreMenu*`      | None          | Categories, favorites, disabled-visible commands.              |

---

## 4. Field & Grid Contracts

### 4.1 Field Control Contract

```ts
interface FieldControlDefinition<TEntity> {
  field: keyof TEntity
  labelKey: I18nKey
  controlType: FieldControlType
  controlConfig?: FieldControlConfig
  state?: FieldStateRule<TEntity>
  layoutHints?: FieldLayoutHints
}
```

### 4.2 Grid Contract

```ts
type DataGridPreset =
  | 'primary'
  | 'inquiry'
  | 'processing'
  | 'readOnly'
  | 'details'
  | 'attributes'
  | 'shortList'

interface GridDefinition<TEntity> {
  id: string
  preset: DataGridPreset
  columns: readonly GridColumnDefinition<TEntity>[]
  toolbar: GridToolbarDefinition
  personalization: GridPersonalizationPolicy
}
```

---

## 5. Command Contract (Two-Layer Hybrid)

Follows [Acumatica's command model](ACUMATICA_ALIGNMENT.md#6-the-command-model-two-layer-hybrid): declarative data objects (Layer 1) resolved by a platform toolbar renderer (Layer 2).

### Layer 1: Declaration (commands.ts)

```ts
interface ScreenCommand {
  // Identity
  key: string
  labelKey: string                          // i18n key: '{module}.{screenId}.actions.{key}'
  icon?: string

  // Placement (static attributes — like PXButton)
  categoryKey: string                       // More Menu category: 'processing', 'activities', 'other'
  displayOnMainToolbar?: boolean            // Also show as toolbar button (default: false)
  favoriteEligible?: boolean                // User can star this command

  // Visibility & enablement (state-driven — like Workflow API)
  isVisible: (state: ScreenState) => boolean
  isEnabled: (state: ScreenState, data: unknown) => boolean
  expectedNext: (state: ScreenState) => boolean    // Green dot + highlighted toolbar button

  // Execution
  execute: (controller: ScreenController) => void | Promise<void>
}
```

### Layer 2: Platform Resolution (FormToolbar)

The `FormToolbar` component reads commands and renders them. No hand-coding per form.

### Rules:

- Unavailable commands remain **visible but disabled** in the More Menu for workflow comprehension.
- Commands are grouped by `categoryKey` in the More Menu.
- User-favorites (★) are promoted from More Menu to the toolbar.
- Expected Next Action (●) is highlighted as a prominent toolbar button.
- Responsive: commands cascade off toolbar into More Menu as screen shrinks.

---

## 6. Density & Visual Doctrine

- **Compact by default**: 30px row height for power users.
- **Surface Hierarchy**: High-density data must live on a Level 2 (White) surface.
- **DataGrid Footer**: Every financial workspace must show row count, financial aggregate, and selection count in the footer.

---

## 7. Enforcement

- No raw business field display outside `AppField`.
- No raw business layout outside `AppTemplate` or `AppFieldset`.
- All interactive elements must have a unique, descriptive ID.
- Business grids must use a `DataGridPreset`.
