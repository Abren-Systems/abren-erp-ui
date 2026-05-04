---
title: 'Module Restructure Plan'
description: 'Plan for restructuring Abren ERP frontend modules from route/page exports to Acumatica-style screen and workspace exports.'
tier: frontend
tags: [frontend, modules, architecture, acumatica]
---

# Module Restructure Plan

> **Status:** Proposed
> **Parent:** `ACUMATICA_ALIGNMENT_STRATEGY.md`

## Purpose

Preserve the 4-layer module architecture, but change what modules expose to the app. Modules should export ERP screens and workspace entries, not only Vue routes and menu items.

## Current Module Contract

```ts
interface ModuleDefinition {
  id: string
  name: string
  category: ModuleCategory
  routes: RouteRecordRaw[]
  permissions: string[]
  menuItems: MenuItem[]
  providers?: Record<string, unknown>
}
```

Problem: this makes routes and menus the structural authority.

## Target Module Contract

```ts
interface ModuleDefinition {
  id: ModuleId
  nameKey: I18nKey
  category: ModuleCategory
  screens: readonly ScreenDefinition<unknown, unknown, ScreenViews>[]
  workspaceEntries: readonly WorkspaceEntry[]
  permissions: readonly ScreenPermission[]
  providers?: Record<string, unknown>
}
```

Routes can be generated from screens during migration.

## Target Module Shape

```text
src/modules/{module}/
├── domain/
├── infrastructure/
├── application/
├── screens.ts
├── workspace.ts
└── ui/
    └── {aggregate}/
        ├── screens/
        ├── views/
        ├── fields/
        ├── grids/
        ├── commands/
        ├── components/
        └── extensions/
```

## AP Pilot Shape

```text
src/modules/finance/ap/
├── screens.ts
├── workspace.ts
└── ui/payment-requests/
    ├── screens/
    │   ├── AP3010PL.screen.ts
    │   └── AP301000.screen.ts
    ├── views/
    │   └── payment-request.views.ts
    ├── fields/
    │   └── payment-request.fields.ts
    ├── grids/
    │   ├── payment-requests.grid.ts
    │   └── payment-request-lines.grid.ts
    ├── commands/
    │   └── payment-request.commands.ts
    ├── components/
    └── extensions/
```

## Screen ID Convention

| Range    | Meaning                | Example    |
| -------- | ---------------------- | ---------- |
| `10xxxx` | Setup / configuration  | `AP101000` |
| `30xxxx` | Data entry             | `AP301000` |
| `30xxPL` | Workspace/list         | `AP3010PL` |
| `40xxxx` | Inquiry                | `AP401000` |
| `50xxxx` | Processing             | `AP501000` |
| `60xxxx` | Report parameter forms | `AP601000` |

## Router Migration

Current:

```text
ModuleDefinition.routes -> Vue Router -> Page SFC
```

Target:

```text
ModuleDefinition.screens -> ScreenRouteMap -> Vue Router -> ScreenRouteRenderer
```

Compatibility stage:

```text
ScreenDefinition.renderTarget = lazy SFC
```

This lets current pages keep rendering while screen metadata moves out of SFCs.

## Rules

- No new business route should be added without a screen ID.
- No new business page should own action state directly.
- Grid definitions move into `grids/`.
- Field/control definitions move into `fields/`.
- Commands move into `commands/`.
- Screen-level layout moves into `screens/*.screen.ts`.
- Module-specific presentational components remain in `components/`.
