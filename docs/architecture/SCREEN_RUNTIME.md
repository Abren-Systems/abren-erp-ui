---
title: 'Screen Runtime & Behavioral Discipline'
description: 'Architecture for stateful ERP screen instances and rules for enforcing the Controller as the absolute authority.'
tier: frontend
tags: [frontend, architecture, screen-runtime, acumatica]
---

# Screen Runtime & Behavioral Discipline

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Last Updated:** May 2026

The screen runtime makes the **ScreenInstance** the primary unit of the frontend. We move away from traditional SPA routing into a stateful, persistent Workspace model where screens are kept alive and governed by strict controllers.

---

## 1. The Instance Paradigm

Unlike a standard web app where navigating destroys the view, Abren ERP treats screens as persistent instances.

```text
Vue Router
  -> Workspace Manager
    -> ScreenInstance[] (Kept Alive in memory)
      -> ScreenController (The strict authority / PXGraph)
        -> Data Graph (reactive aggregate)
        -> Command Registry (PXAction)
      -> ScreenRenderer
        -> ScreenDefinition (Metadata)
        -> Working Area (view.vue - pure layout)
        -> AppSidePanel (Trace/Filing Cabinet)
```

### Why this matters:

- **Persistence**: Opening the same record twice brings the existing instance to the foreground.
- **Isolation**: Unsaved edits and scroll positions are isolated per instance.
- **Authority**: All behavior flows through a single, authoritative controller governing a state machine.

---

## 2. Behavioral Archetypes (Screen ID)

The frontend is organized by Acumatica-style archetypes encoded in the **Screen ID**. This enforces what a screen is allowed to do.

| Screen Range | Archetype       | Purpose                                         | Example    |
| ------------ | --------------- | ----------------------------------------------- | ---------- |
| `*10*`       | **Setup**       | Configuration and module preferences.           | `AP101000` |
| `*20*`       | **Profile**     | Master data maintenance (Nouns).                | `AP201000` |
| `*30*`       | **Transaction** | Core operational data entry (Single Documents). | `AP301000` |
| `*PL`        | **Workspace**   | Primary list views / workboards.                | `AP3010PL` |
| `*40*`       | **Inquiry**     | Read-only views and analytical grids.           | `AP401000` |
| `*50*`       | **Processing**  | Bulk processing screens (Batch actions).        | `AP501000` |
| `*60*`       | **Report**      | Formatted printable reports.                    | `AP601000` |

---

## 3. Controller Authority (The PXGraph)

The Screen Controller is a Class-like module that acts as the absolute authority for a screen's behavior. The View (`view.vue`) is a pure projection of the controller and is **not allowed** to mutate data or fetch data directly.

### Rules:

1. **Owns Data Access**: The controller's setup routine must directly fetch data via the Module Adapter. It does not rely on external hooks passed in.
2. **Dual-Layer State Machine**: The controller evaluates permissions and visibility based on:
   - **UIState**: `INITIALIZING`, `NEW`, `VIEW`, `EDIT`, `SAVING`.
   - **DomainState**: `DRAFT`, `SUBMITTED`, `APPROVED`, etc.
3. **Mutation Guards**: All mutations must throw or block if the State Machine dictates the record is read-only.

---

## 4. The Binding Layer (PXField & PXAction)

Components must never bind directly to raw data. They use the **Binding API** to inherit behavior from the controller.

### Binding Composables:

- `useField(key)`: Retrieves the memoized value, evaluates `readonly` against the State Machine and `FieldDefinition`, and exposes an `onChange` mutation.
- `useGrid(key)`: Retrieves a tabular subgraph. Grids do not fetch their own data; they are projections of the controller's data graph.
- `useCommand(key)`: Binds a button to a workflow action. Automatically handles `disabled/hidden` states based on the state machine.

### View Constraints:

```vue
<!-- WRONG: View contains logic and direct mutation -->
<AppField :value="data.status" @update="save" :readonly="data.status === 'PAID'" />

<!-- RIGHT: View is pure projection via Binding API -->
<AppField v-bind="useField('status')" />
<AppButton v-bind="useCommand('release')" />
```

---

## 5. Screen Renderer Responsibilities

- **Mount the Chrome**: Render standard title bar, toolbar, summary area, and tabs.
- **Pure Projection**: The renderer and the `view.vue` it mounts contain **zero business logic**.
- **Instance Management**: The runtime preserves active work. Navigating away **deactivates** rather than destroys the instance.
