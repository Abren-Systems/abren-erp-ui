---
title: 'Component Contracts'
description: 'Formal component contracts for Acumatica-style ERP components, including ID, label, placement, configuration, personalization, and testing rules.'
tier: frontend
tags: [frontend, components, design-system, acumatica]
---

# Component Contracts

> **Status:** Proposed
> **Parent:** `ACUMATICA_ALIGNMENT_STRATEGY.md`

## Purpose

Acumatica components are not free-form widgets. They carry naming conventions, caption rules, layout rules, configuration APIs, personalization behavior, and test hooks.

Abren should adopt the same discipline through a component contract registry.

## Contract Type

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

## Required Contracts

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
| Splitter             | `splitter-*`     | None          | Exactly two panes.                                             |
| Split pane           | `splitPaneA/B-*` | None          | Used only inside splitter.                                     |
| Record services menu | `recordServices` | None          | Notes, files, activities, audit, link, notifications.          |
| More menu            | `moreMenu*`      | None          | Categories, favorites, disabled-visible commands.              |

## Field Control Contract

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

Supported controls should include:

- text
- number
- money/currency
- date/time
- checkbox
- combo box
- radio group
- selector
- mask editor
- rich text
- file/image upload
- link/mail editor

## Grid Contract

```ts
type DataGridPreset =
  | 'primary'
  | 'inquiry'
  | 'processing'
  | 'readOnly'
  | 'details'
  | 'attributes'
  | 'shortList'
```

```ts
interface GridDefinition<TEntity> {
  id: string
  preset: DataGridPreset
  columns: readonly GridColumnDefinition<TEntity>[]
  toolbar: GridToolbarDefinition
  personalization: GridPersonalizationPolicy
  rowServices?: RowServicesDefinition
}
```

```ts
interface GridColumnDefinition<TEntity> {
  field: keyof TEntity
  labelKey: I18nKey
  columnConfig: GridColumnConfig
  linkCommand?: string
}
```

## Command Contract

```ts
interface ScreenCommand {
  key: string
  labelKey: I18nKey
  categoryKey?: I18nKey
  variant: 'primary' | 'neutral' | 'danger'
  visible: boolean
  enabled: boolean
  expectedNext?: boolean
  favoriteEligible?: boolean
  requiresConfirmation?: boolean
}
```

Command rules:

- Unavailable commands should remain visible but disabled when useful for workflow comprehension.
- Commands are grouped in More by category.
- User-favorite commands can be promoted to the toolbar.
- Expected next command can be highlighted.
- Destructive and state-reversing commands require confirmation.

## Enforcement

Add checks for:

- missing screen IDs
- missing component IDs
- raw business field display outside `AppField`
- raw business layout outside `AppTemplate`/`AppFieldset`
- business grids without `DataGridPreset`
- column labels without localization keys
- commands without category/label metadata
