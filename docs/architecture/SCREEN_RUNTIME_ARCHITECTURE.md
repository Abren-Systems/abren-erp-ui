---
title: 'Screen Runtime Architecture'
description: 'Architecture for replacing route/page-first Vue screens with Acumatica-style stateful ERP screen instances managed by the Workspace.'
tier: frontend
tags: [frontend, architecture, screen-runtime, acumatica, workspace]
---

# Screen Runtime Architecture

> **Status:** Accepted (Phase 5)
> **Parent:** `ACUMATICA_ALIGNMENT_STRATEGY.md`

## Purpose

The screen runtime makes the **ScreenInstance** the primary unit of the frontend. We are moving away from traditional SPA routing (where navigating destroys the previous view) into a stateful, persistent Workspace model where screens are loaded into memory and kept alive, governed by strict controllers.

## Legacy Model (Container-based)

```text
Vue Router
  -> Module routes
    -> Page SFC (view.vue)
      -> Composables (Hooks)
      -> Shared components
```

This model blurs data ownership and makes Acumatica alignment hard to enforce. Components mutate state, and navigating away destroys the unsaved work.

## Target Model (Acumatica-grade Instance Paradigm)

```text
Vue Router
  -> Workspace Manager
    -> ScreenInstance[] (Kept Alive in memory)
      -> ScreenController (The strict authority / PXGraph)
        -> Data Graph (reactive aggregate)
        -> Command Registry
      -> ScreenRenderer
        -> ScreenDefinition (Metadata)
        -> Working Area (view.vue - pure layout)
        -> AppSidePanel
```

## ERP Screen Taxonomy

The frontend is organized strictly by Acumatica-style behavioral archetypes, rather than arbitrary features. This enforces what a screen is allowed to do.

| Directory          | Equivalent  | Purpose                                                                               | Example    |
| ------------------ | ----------- | ------------------------------------------------------------------------------------- | ---------- |
| `ui/transactions/` | `00` / `PL` | Core operational data entry and primary lists. Single documents with workflow states. | `AP301000` |
| `ui/profiles/`     | `10` / `20` | Master data maintenance (nouns).                                                      | `AP303000` |
| `ui/processing/`   | `50`        | Bulk processing screens that release outbox events.                                   | `AP501000` |
| `ui/setup/`        | `10`        | Configuration and module preferences.                                                 | `AP101000` |

## Screen Instance Layer

The runtime must preserve active work. Screens are **never destroyed** on navigation; they are **activated**.

```ts
interface ScreenInstance {
  id: string // UUID or specific entity ID
  definition: ScreenDefinition
  controller: ScreenController // The state machine authority
  lastAccessedAt: string
}
```

### Why this matters:

- Opening the same record twice brings the existing instance to the foreground.
- Drafts and scroll positions persist.
- Unsaved edits are isolated per instance.

## Screen Renderer Responsibilities

- **Mount the Chrome:** Render standard title bar, toolbar, summary, tabs, grids, and AppSidePanel.
- **Provide Context:** Expose the `ScreenController` to the layout components.
- **Pure Projection:** The renderer and the `view.vue` it mounts contain **zero business logic**. They only bind to the controller via the Binding API (`useField`, `useCommand`).
