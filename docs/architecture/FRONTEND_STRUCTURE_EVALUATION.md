---
title: 'Frontend Structure Evaluation'
description: 'Evaluation of the current Abren ERP frontend project structure against the target Acumatica-style screen runtime architecture.'
tier: frontend
tags: [frontend, architecture, structure, acumatica]
---

# Frontend Structure Evaluation

> **Status:** Proposed
> **Reviewed against:** Acumatica UI Developer Guide, End-User Interface Guide, UI Component Guide, and the current Abren frontend tree.

## Executive Finding

The current frontend structure has a strong domain foundation, but it is still a **Vue route/page application**. Acumatica is a **screen operating system**.

That difference matters. In Acumatica, routes, menus, fields, grids, actions, personalization, reports, record services, and test hooks are consequences of a registered screen model. In Abren today, these concerns are distributed across `routes.ts`, `index.ts`, page SFCs, grid files, shared components, and shell components.

The 4-layer module structure should be preserved, but the frontend project needs a new platform layer that makes screens, component contracts, workspace services, and personalization first-class.

## Current Structure Summary

Current top-level shape:

```text
src/
├── app/
│   ├── components/
│   ├── layouts/
│   └── router/
├── modules/
│   ├── core/
│   ├── finance/
│   ├── inventory/
│   ├── reporting/
│   └── workflows/
├── shared/
│   ├── components/
│   ├── composables/
│   ├── domain/
│   ├── infrastructure/
│   ├── types/
│   └── workspace/
└── assets/
```

This is coherent for a modular SPA. It is not yet enough for an Acumatica-style ERP shell.

## What Is Working

### 1. Domain-Aligned Module Boundaries

Modules map reasonably well to backend bounded contexts:

- `src/modules/finance/ap`
- `src/modules/finance/ledger`
- `src/modules/finance/bank`
- `src/modules/finance/tax`
- `src/modules/inventory`
- `src/modules/reporting`
- `src/modules/core`
- `src/modules/workflows`

The 4-layer split of `domain`, `application`, `infrastructure`, and `ui` is the right foundation and should not be discarded.

### 2. Shared ERP Primitives Already Exist

The project already has the beginnings of an owned ERP UI layer:

- `src/shared/components/field-system`
- `src/shared/components/data-grid`
- `src/shared/components/workspace`
- `src/shared/components/primitives`
- `src/shared/workspace`

This is valuable. The rewrite should promote these into stricter runtime contracts, not replace them with a vendor design system.

### 3. Screen Runtime Types Have Started

`src/shared/workspace/screen.types.ts`, `controller.types.ts`, `command.types.ts`, and `workspace.types.ts` already point in the correct direction. They are not wired into routing or rendering yet, but they show the intended destination.

### 4. AP Screens Are Good Pilot Candidates

`PaymentRequestsListPage.vue` and `PaymentRequestFocus.vue` already approximate the Acumatica split between a dense list/workspace and a data-entry/focus screen. They should become the first registered screens.

## Structural Gaps

### 1. `ModuleDefinition` Is Route-First

Current module registration is centered on:

```ts
interface ModuleDefinition {
  id: string
  name: string
  category: ModuleCategory
  routes: RouteRecordRaw[]
  permissions: string[]
  menuItems: MenuItem[]
}
```

This makes the route tree the structural authority. In Acumatica, the screen definition is the authority. Routes and menus should be generated from registered screens and workspace/menu configuration.

### 2. Router Loads Pages Directly

`src/app/router/index.ts` aggregates module routes and renders lazy page components. This keeps Vue Router as the primary UI composition mechanism.

Target direction:

```text
Route -> ScreenResolver -> ScreenInstance -> ScreenRenderer -> ScreenDefinition
```

The router should locate and open a screen. It should not be responsible for screen structure.

### 3. Shell Is Layout, Not Operating Environment

`AuthenticatedLayout.vue` currently renders:

```text
AppSidebar
AppTopPane
RouterView
```

That is a shell layout. Acumatica requires a working environment:

- global search overlay that preserves the current screen
- recently viewed records
- favorite screens and records
- tenant/company/branch selector
- business date
- help and screen tools
- configurable workspaces
- active screen instance state

These should live under a platform-owned workspace runtime, not inside scattered page components.

### 4. `shared/components` Mixes Primitive, ERP, And Vendor-Like Layers

Current shared components are grouped mostly by implementation category:

```text
shared/components/
├── primitives/
├── field-system/
├── data-grid/
├── workspace/
├── dialog/
├── dropdown-menu/
├── sheet/
└── table/
```

This is usable, but the boundaries are blurry. Acumatica-style UI needs a clearer split:

- low-level headless primitives
- ERP component contracts
- screen renderer components
- platform shell components
- domain/module components

### 5. Page SFCs Still Own Too Much Structure

Many module pages still decide their own screen taxonomy, layout, command placement, grid behavior, field rendering, and dialogs. This makes Acumatica alignment depend on developer discipline.

Target direction: page SFCs should shrink or disappear for business screens. A module should export screen definitions, and the shared screen renderer should compose the layout.

### 6. Grids Are Centralized But Not Contract-Driven

`DataGrid` centralizes TanStack Table rendering, but business semantics are still mostly props and slots:

- no required grid preset
- no standard column contract
- no persisted personal/shared filters
- no admin-shared layouts
- no standard shortcut menu
- no standard note/file row services
- no formal import/export contract

Acumatica treats tables as personalized work surfaces. Abren's grid should move from component wrapper to grid platform.

### 7. Field System Is Display-Oriented, Not Fully Metadata-Oriented

The Field System correctly enforces stable field identity and value purity. The missing layer is Acumatica-style control metadata:

- selector
- combo box
- radio group
- checkbox
- mask editor
- date/time editor
- currency editor
- upload/image editor
- rich text
- lookup command

The Field System should become both display and control orchestration.

### 8. Module UI Folders Are Aggregate-Oriented But Not Screen-Oriented

Current AP shape:

```text
ui/payment-requests/
├── components/
├── grids/
└── pages/
```

This is good for local organization, but the runtime needs explicit screen assets:

```text
ui/payment-requests/
├── screens/
├── views/
├── commands/
├── grids/
├── fields/
├── components/
└── extensions/
```

## Target Project Structure

Recommended target:

```text
src/
├── app/
│   ├── router/
│   │   ├── index.ts
│   │   └── screen-route-resolver.ts
│   ├── shell/
│   │   ├── AcumaticaShell.vue
│   │   ├── GlobalSearchWorkspace.vue
│   │   ├── RecentlyViewedMenu.vue
│   │   ├── WorkspaceMenu.vue
│   │   └── TenantContextMenu.vue
│   └── screens/
│       ├── registry.ts
│       ├── screen-renderer.ts
│       └── screen-route-map.ts
│
├── platform/
│   ├── screen-runtime/
│   │   ├── screen-definition.types.ts
│   │   ├── screen-instance.store.ts
│   │   ├── screen-controller.types.ts
│   │   ├── screen-extension.types.ts
│   │   └── screen-renderer/
│   ├── component-contracts/
│   │   ├── component-contract.types.ts
│   │   ├── contract-registry.ts
│   │   └── contracts/
│   ├── commands/
│   │   ├── command.types.ts
│   │   ├── command-renderer.ts
│   │   └── command-favorites.store.ts
│   ├── personalization/
│   │   ├── screen-configuration.types.ts
│   │   ├── personalization-store.ts
│   │   └── configuration-merge.ts
│   ├── navigation/
│   │   ├── workspace-definition.types.ts
│   │   ├── menu-configuration.types.ts
│   │   └── recently-viewed.store.ts
│   └── reports/
│       ├── report-screen.types.ts
│       └── report-template.store.ts
│
├── shared/
│   ├── ui/
│   │   ├── primitives/
│   │   ├── erp/
│   │   └── screen/
│   ├── api/
│   ├── auth/
│   ├── domain/
│   ├── composables/
│   └── lib/
│
├── modules/
│   └── finance/ap/
│       ├── domain/
│       ├── infrastructure/
│       ├── application/
│       ├── screens.ts
│       ├── workspace.ts
│       └── ui/
│           └── payment-requests/
│               ├── screens/
│               ├── views/
│               ├── commands/
│               ├── fields/
│               ├── grids/
│               ├── components/
│               └── extensions/
└── assets/
```

## Required Structural Changes

### 1. Introduce `platform/`

Move ERP runtime concerns out of `shared/`. `shared/` should remain reusable utilities and visual primitives. `platform/` should own Acumatica-like operating behavior:

- screen runtime
- component contracts
- command system
- personalization
- navigation/workspaces
- report runtime
- record services

### 2. Split Shared UI Into Layers

Recommended shared UI split:

```text
src/shared/ui/
├── primitives/       # buttons, inputs, labels, popovers, dialogs
├── erp/              # AppField, AppFieldset, DataGrid, AppTemplate, AppTabs
└── screen/           # ScreenTitleBar, ScreenToolbar, RecordServicesMenu
```

The current `src/shared/components` can migrate gradually. Avoid a big-bang move.

### 3. Replace Route-First Module Exports

Current:

```ts
export const apModule = {
  routes,
  menuItems,
}
```

Target:

```ts
export const apModule = {
  screens,
  workspaceEntries,
  permissions,
  providers,
}
```

Routes can remain during migration, but they should become generated compatibility adapters.

### 4. Add Screen Assets To Modules

Each business module should export screens, not pages:

```text
finance/ap/
├── screens.ts
├── workspace.ts
└── ui/payment-requests/
    ├── screens/AP301000.screen.ts
    ├── screens/AP3010PL.screen.ts
    ├── views/payment-request.views.ts
    ├── commands/payment-request.commands.ts
    ├── fields/payment-request.fields.ts
    └── grids/payment-request-lines.grid.ts
```

### 5. Make Screen IDs Mandatory

Adopt an Acumatica-style ID scheme:

| Range    | Meaning                | Example    |
| -------- | ---------------------- | ---------- |
| `10xxxx` | Setup / configuration  | `AP101000` |
| `30xxxx` | Data entry             | `AP301000` |
| `30xxPL` | Workspace/list         | `AP3010PL` |
| `40xxxx` | Inquiry                | `AP401000` |
| `50xxxx` | Processing             | `AP501000` |
| `60xxxx` | Report parameter forms | `AP601000` |

The exact numbering can evolve, but every screen needs a stable ID.

## Migration Recommendation

Do not restructure everything at once.

1. Keep existing module folders.
2. Add `platform/` with screen runtime contracts.
3. Add `screens.ts` to AP only.
4. Register `PaymentRequestsListPage.vue` as `AP3010PL`.
5. Register `PaymentRequestFocus.vue` as `AP301000`.
6. Build a compatibility `ScreenRouteRenderer` that still lazy-loads the current SFCs.
7. Move AP grid/field/action metadata out of SFCs into screen assets.
8. Repeat for Ledger setup, an inquiry screen, a processing screen, and a report.

This gives the rewrite a controlled migration path while preserving the parts of the frontend that are already valuable.
