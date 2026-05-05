---
title: 'Component System & Contracts'
description: 'Authoritative guide for component ownership, layers, and formal contracts for Acumatica-style ERP components.'
tier: frontend
tags: [frontend, components, design-system, acumatica]
---

# Component System & Contracts

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
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

- `AppButton`, `AppInput`, `AppSelect`, `AppBadge`, `AppDrawer`, `AppDialog`.
- `AppSidePane` — Contextual overlays (`mode="overlay"` for filters, `mode="docked"` for trace panes).

### 2.2 Screen Layer

Repeatable screen structure compositions:

- `ScreenTitleBar`, `ScreenToolbar`, `MoreMenu`, `RecordServicesMenu`, `WorkspacePanel`, `EmptyState`.

### 2.3 Field System Layer (Working Area)

Governs all data display and layout inside the Working Area. See [Field System Architecture](../FIELD_SYSTEM.md).

- `AppField` — Semantic data renderer.
- `AppFieldset` — CSS Grid layout authority (140px baseline).
- `AppTemplate` — Named screen template authority for Acumatica-style slot widths.
- `AppTabs` — Personalizable visibility toggle for data strata.
- `DataGrid` — Tabular rendering platform with preset-driven logic.

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

## 5. Command Contract

```ts
interface ScreenCommand {
  key: string
  labelKey: I18nKey
  categoryKey?: I18nKey
  variant: 'primary' | 'neutral' | 'danger'
  visible: boolean
  enabled: boolean
  favoriteEligible?: boolean
}
```

- **Rules**: Unavailable commands remain visible but disabled for workflow comprehension. Commands are grouped in `MoreMenu` by category. User-favorites can be promoted to the toolbar.

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
