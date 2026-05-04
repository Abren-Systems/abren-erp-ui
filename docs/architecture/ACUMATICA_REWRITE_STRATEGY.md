---
title: 'Acumatica Rewrite Strategy'
description: 'Architecture, structure, design system, component, and UX/UI rewrite strategy for making Abren ERP match Acumatica-style ERP operation.'
tier: frontend
tags: [frontend, architecture, ux, design-system, acumatica]
---

# Acumatica Rewrite Strategy

> **Status:** Proposed
> **Companion documents:** `ACUMATICA_ALIGNMENT_PROPOSAL.md`, `FRONTEND_STRUCTURE_EVALUATION.md`

## Position

Abren should not merely borrow Acumatica visual cues. The frontend should be rewritten around Acumatica's deeper operating model:

```text
Shell -> Workspace -> Screen Instance -> Screen Definition -> Views -> Components -> Commands
```

The current Abren frontend is structurally sound as a modular Vue application, but the target is more specific: an ERP screen runtime with formal component contracts, personalization, command metadata, record services, and persistent working context.

## Rewrite Scope

This is a five-layer rewrite:

1. **Architecture Rewrite:** route/page runtime becomes screen runtime.
2. **Project Structure Rewrite:** modules export screens/workspaces/configuration, not only routes/pages.
3. **Design System Rewrite:** shared UI becomes an ERP design system with contracts.
4. **Component Model Rewrite:** fields, grids, tabs, dialogs, buttons, menus, and title bars become metadata-driven business primitives.
5. **UX/UI Strategy Rewrite:** the product behaves like a persistent ERP working environment.

## 1. Architecture Rewrite

### Current Model

```text
Vue Router
  -> Module routes
    -> Page SFC
      -> Shared components
      -> Local commands
      -> Local layout
```

This is easy to build but hard to govern. It produces screen drift because each page can invent structure.

### Target Model

```text
Vue Router
  -> ScreenRouteResolver
    -> ScreenInstanceStore
      -> ScreenRenderer
        -> ScreenDefinition
          -> ScreenViews
          -> ScreenLayout
          -> ScreenCommands
          -> ScreenConfiguration
          -> ComponentContracts
```

Routes remain useful for browser navigation. They stop being the screen authority.

### Required Changes

- Introduce a global `ScreenRegistry`.
- Make `ScreenDefinition` the unit of routing, permission, menu registration, testing, personalization, and localization.
- Add `ScreenInstanceStore` so global search/help/recently viewed overlays preserve unsaved screen state.
- Convert local page action arrays into `ScreenCommand` metadata.
- Add typed screen views for single records, collections, processing selections, and reports.
- Merge runtime screen metadata from base definition, backend capabilities, tenant extensions, and user/system personalization.

## 2. Project Structure Rewrite

### Current Module Export

```ts
export const module = {
  id,
  name,
  routes,
  permissions,
  menuItems,
}
```

### Target Module Export

```ts
export const module = {
  id,
  name,
  category,
  screens,
  workspaceEntries,
  permissions,
  providers,
}
```

The module should no longer tell the application, "Here are my pages." It should tell the platform, "Here are my ERP screens and workspace entries."

### Target Feature Slice

```text
ui/{aggregate}/
├── screens/       # Screen definitions by screen ID
├── views/         # Single/collection/report view metadata
├── fields/        # Field and control definitions
├── grids/         # Grid and column definitions
├── commands/      # Screen command definitions
├── components/    # Domain-specific presentational components
└── extensions/    # Feature/tenant extension points
```

### Migration Rule

During migration, pages may remain as compatibility render targets. New work should be screen-first.

## 3. Design System Rewrite

### Current State

Abren has a useful shared component layer, but it is still organized like a component library:

- primitives
- field system
- data grid
- workspace components
- dialogs
- sheets
- dropdowns

The target is an ERP design system that defines behavior, naming, and metadata contracts.

### Target Design System Layers

```text
Primitives
  Low-level accessible wrappers: button, input, dialog, select, checkbox.

ERP Components
  AppField, AppFieldset, AppTemplate, AppTabs, DataGrid, AppDialog, AppSelector.

Screen Components
  ScreenTitleBar, ScreenToolbar, MoreMenu, RecordServicesMenu, ScreenSummary.

Platform Shell
  GlobalSearchWorkspace, RecentlyViewed, WorkspaceMenu, TenantContext, Help.
```

### Design System Doctrine

- Components are not only visual wrappers.
- Every business component has a contract.
- Every contract defines ID prefix, label convention, allowed placement, configuration schema, personalization behavior, and test role.
- Visual consistency comes from metadata and constrained composition, not from designers manually matching screens.

## 4. Component Model Rewrite

### Component Contract Registry

Introduce:

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

Initial contracts:

| Component             | Contract Emphasis                                           |
| --------------------- | ----------------------------------------------------------- |
| `AppButton`           | verb captions, command source, More menu placement          |
| `AppDialog`           | title/question convention, sizes, footer command semantics  |
| `AppFieldset`         | section identity, label rules, template placement           |
| `AppTemplate`         | Acumatica-like named column templates                       |
| `AppTabs`             | noun labels, no single-tab screens, personalization support |
| `DataGrid`            | required preset, column contract, saved layouts             |
| `AppSelector`         | lookup display, link command, parameters, access filtering  |
| `RecordServicesMenu`  | notes, files, activities, audit, link, notifications        |
| `ScreenToolbar`       | standard actions, command favorites, expected next action   |
| `GlobalSearchOverlay` | preserves active screen instance                            |

### Field Model

Current `AppField` should evolve from display renderer to metadata-driven field renderer:

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

Field controls to support:

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

### Grid Model

`DataGrid` should require:

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

This is the difference between a table component and an ERP table platform.

## 5. UX/UI Strategy Rewrite

### Current UX Grammar

The current doctrine is:

```text
Workspace -> Focus -> Trace Drawer -> Confirmed Action
```

Keep this. It is compatible with Acumatica.

### Expanded Acumatica Grammar

```text
Persistent Shell
  -> Workspace Menu / Global Search / Recently Viewed
    -> Screen Instance
      -> Title Bar / Toolbar / Summary
        -> Tabs / Grids / Panels / Dialogs
          -> Commands / Record Services / Personalization
```

### Required UX Capabilities

- Persistent shell with working area.
- Global search overlay that does not destroy current work.
- Recently viewed records with favorite records.
- Favorite screens and favorite commands.
- Configurable workspace menu.
- Standard screen title bar.
- Standard More menu.
- Disabled-but-visible unavailable commands.
- Expected next action highlighting.
- Record services: notes, files, activities, audit history, get link, notifications.
- Saved filters and shared filters.
- Personalized grid columns and admin-shared layouts.
- First-class setup, data-entry, processing, inquiry, workspace/list, and report screens.

## Frontend Rewrite Roadmap

### Phase 0: Governance

- Mark `ACUMATICA_REWRITE_STRATEGY.md` as the governing UX/UI rewrite direction.
- Keep existing architecture docs but identify superseded route/page assumptions.
- Add a short ADR stating: "Screen runtime is the frontend architectural authority."

### Phase 1: Runtime Foundation

- Create `src/platform/screen-runtime`.
- Move or re-export current `src/shared/workspace` types through the new platform namespace.
- Harden `ScreenDefinition`, `ScreenView`, `ScreenCommand`, `ScreenInstance`, and `ScreenConfiguration`.
- Add a registry and a compatibility renderer.

### Phase 2: Project Structure Pilot

- Add `screens.ts` to `finance/ap`.
- Add `AP3010PL.screen.ts` for payment request list.
- Add `AP301000.screen.ts` for payment request focus.
- Keep the existing SFC pages as render targets while moving metadata out.
- Generate compatibility routes from screen definitions.

### Phase 3: Design System Contract Layer

- Create `src/platform/component-contracts`.
- Register contracts for buttons, dialogs, fieldsets, templates, tabs, grids, selectors, menus, and title bars.
- Add lint or runtime warnings for missing screen IDs, component IDs, grid presets, and label keys.

### Phase 4: Screen Renderer Primitives

- Build `AppTemplate`.
- Build `ScreenTitleBar`.
- Build `ScreenToolbar`.
- Build `MoreMenu`.
- Build `RecordServicesMenu`.
- Extend `DataGrid` with preset and column definitions.

### Phase 5: Shell Services

- Build screen-preserving global search overlay.
- Build recently viewed records.
- Build favorite screens/records/commands.
- Build workspace menu configuration.
- Add business date and tenant/company/branch UX.

### Phase 6: Broaden Screen Taxonomy

Convert one example of each:

| Screen Kind | Candidate                          |
| ----------- | ---------------------------------- |
| Workspace   | Payment Requests                   |
| Data Entry  | Payment Request Focus              |
| Setup       | Ledger Settings                    |
| Inquiry     | Journal Entries or Cashflow query  |
| Processing  | Batch approval/payment execution   |
| Report      | First parameterized finance report |

## Rewrite Principles

- Preserve the 4-layer module architecture.
- Stop treating route pages as the primary UI unit.
- Promote screen IDs, component IDs, field IDs, grid IDs, and command IDs into stable contracts.
- Keep TanStack Query/Table/Form as engines, not as product architecture.
- Keep Abren-owned components as the visual foundation.
- Make personalization, localization, testability, and customization part of the base screen definition.
- Do not allow Acumatica alignment to depend on developer memory.

## Decision

The correct rewrite is not a visual redesign. It is an **ERP runtime redesign**.

The first successful milestone is when `PaymentRequestsListPage` and `PaymentRequestFocus` can be opened through registered Acumatica-style screen definitions, rendered by shared screen primitives, and described by metadata for layout, commands, fields, grids, IDs, permissions, and personalization.
