---
title: 'Screen Runtime Architecture'
description: 'Architecture for replacing route/page-first Vue screens with Acumatica-style registered ERP screen runtime.'
tier: frontend
tags: [frontend, architecture, screen-runtime, acumatica]
---

# Screen Runtime Architecture

> **Status:** Proposed
> **Parent:** `ACUMATICA_ALIGNMENT_STRATEGY.md`

## Purpose

The screen runtime makes `ScreenDefinition` the primary unit of the frontend. Routes, menus, permissions, test IDs, localization, commands, layouts, and personalization become consumers of screen metadata.

## Current Model

```text
Vue Router
  -> Module routes
    -> Page SFC
      -> Local layout
      -> Local commands
      -> Shared components
```

This keeps structure inside page components and makes Acumatica alignment hard to enforce.

## Target Model

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
```

## Runtime Packages

Target location:

```text
src/platform/screen-runtime/
├── screen-definition.types.ts
├── screen-view.types.ts
├── screen-layout.types.ts
├── screen-instance.store.ts
├── screen-registry.ts
├── screen-route-resolver.ts
├── screen-renderer/
├── screen-extension.types.ts
└── screen-configuration.types.ts
```

Existing `src/shared/workspace/*` types should be moved or re-exported through this namespace during migration.

## Core Types

```ts
interface ScreenDefinition<TEntity, TContext, TViews extends ScreenViews> {
  id: ScreenId
  moduleId: ModuleId
  kind: ScreenKind
  titleKey: I18nKey
  primaryView: keyof TViews
  route: ScreenRoute
  permissions: ScreenPermission[]
  views: TViews
  layout: ScreenLayoutDefinition<TViews>
  commands: ScreenCommandDefinition<TEntity>[]
  personalization: ScreenPersonalizationPolicy
  test: ScreenTestContract
}
```

```ts
type ScreenKind =
  | 'workspace'
  | 'dataEntry'
  | 'setup'
  | 'processing'
  | 'inquiry'
  | 'report'
  | 'workboard'
```

```ts
type ScreenViewKind = 'single' | 'collection' | 'selection' | 'report'

interface ScreenView<TEntity> {
  name: string
  kind: ScreenViewKind
  containerName: string
  queryKey: readonly unknown[]
  fields: readonly FieldControlDefinition<TEntity>[]
}
```

## Screen Instance Store

The runtime must preserve active work while global search, help, recently viewed, and overlays open.

```ts
interface ScreenInstance<TContext = unknown> {
  instanceId: ScreenInstanceId
  screenId: ScreenId
  context: TContext
  dirty: boolean
  lastAccessedAt: string
  title: string
}
```

## Metadata Merge

Runtime screen rendering should merge:

```text
Base ScreenDefinition
  + Backend capability metadata
  + Tenant extensions
  + System ScreenConfiguration
  + Role/User ScreenConfiguration
  = Runtime Screen Model
```

## Screen Renderer Responsibilities

- Render standard title bar, toolbar, summary, tabs, grids, panels, dialogs, and record services.
- Apply layout templates and component contracts.
- Resolve commands and More-menu placement.
- Apply personalization and configuration.
- Emit intents, not business decisions.

## Pilot Screens

| Screen ID  | Current Component             | Kind        |
| ---------- | ----------------------------- | ----------- |
| `AP3010PL` | `PaymentRequestsListPage.vue` | `workspace` |
| `AP301000` | `PaymentRequestFocus.vue`     | `dataEntry` |
