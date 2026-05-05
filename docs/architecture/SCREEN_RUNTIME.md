---
title: 'Screen Runtime & Behavioral Discipline'
description: 'Architecture for stateful ERP screen instances, form toolbar rendering, command model, side panel binding, and rules for enforcing the Controller as absolute authority.'
tier: frontend
tags: [frontend, architecture, screen-runtime, acumatica]
---

# Screen Runtime & Behavioral Discipline

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Companion:** [Acumatica Alignment](ACUMATICA_ALIGNMENT.md) — maps all concepts to Acumatica's mental model
> **Last Updated:** May 2026

The screen runtime makes the **ScreenInstance** the primary unit of the frontend. We move away from traditional SPA routing into a stateful, persistent model where screens are kept alive and governed by strict controllers.

---

## 1. The Instance Paradigm

Unlike a standard web app where navigating destroys the view, Abren ERP treats screens as persistent instances.

```text
Vue Router
  -> Workspace Manager
    -> ScreenInstance[] (Kept Alive in memory)
      -> ScreenController (The strict authority / PXGraph)
        -> Data Graph (reactive aggregate)
        -> Command Registry (PXAction declarations)
      -> ScreenRenderer
        -> ScreenDefinition (Metadata — screen.ts)
        -> FormTitleBar (record-level services)
        -> FormToolbar (command rendering)
        -> Working Area (view.vue — pure layout)
        -> AppSidePanel (contextual record details)
```

### Why this matters:

- **Persistence**: Opening the same record twice brings the existing instance to the foreground.
- **Isolation**: Unsaved edits and scroll positions are isolated per instance.
- **Authority**: All behavior flows through a single, authoritative controller governing a state machine.

---

## 2. Behavioral Archetypes (Screen ID → Form Kind)

The frontend is organized by Acumatica-style archetypes encoded in the **Screen ID**. Each archetype maps to a Form Kind (see [Acumatica Alignment §3](ACUMATICA_ALIGNMENT.md#3-form-kinds-what-appears-in-the-working-area)) that enforces what a form is allowed to do.

| Area Code | Archetype        | Form Kind     | Purpose                                   | Example    |
| --------- | ---------------- | ------------- | ----------------------------------------- | ---------- |
| `10`      | **Setup**        | `setup`       | Configuration and module preferences      | `AP101000` |
| `20`      | **Maintenance**  | `maintenance` | Master data management (Vendors, Items)   | `AP201000` |
| `30`      | **Data Entry**   | `dataEntry`   | Transactional document entry (Bills, JEs) | `AP301000` |
| `PL`      | **Primary List** | `inquiry`     | Paired list/inquiry for data entry forms  | `AP3010PL` |
| `40`      | **Inquiry**      | `inquiry`     | Read-only analytical grids                | `AP401000` |
| `50`      | **Processing**   | `processing`  | Bulk processing screens (deferred)        | `AP501000` |
| `60`      | **Report**       | `report`      | Formatted printable reports               | `AP601000` |

---

## 3. Controller Authority (The PXGraph)

The Screen Controller is the absolute authority for a form's behavior. The View (`view.vue`) is a pure projection — **not allowed** to mutate data, fetch data, or evaluate visibility rules.

### Rules:

1. **Owns Data Access**: The controller fetches data via the module's infrastructure layer (adapter → composable). No external hooks passed in.
2. **Owns Command Registry**: All commands are declared as data objects in `commands.ts` and registered in the controller. The view binds to them, never creates them.
3. **Dual-Layer State Machine**: The controller evaluates permissions based on:
   - **UIState**: `INITIALIZING`, `NEW`, `VIEW`, `EDIT`, `SAVING`.
   - **DomainState**: `DRAFT`, `SUBMITTED`, `APPROVED`, etc. (backend-owned).
4. **Mutation Guards**: All mutations must throw or block if the State Machine dictates the record is read-only.

---

## 4. Form Title Bar Rendering

The Form Title Bar is rendered by the `FormTitleBar` component (platform-level). It is **not** hand-coded per form.

### Rendering Rules:

```
┌───────────────────────────────────────────────────────────────────────┐
│ {screenDefinition.title}                                              │
│ {recordId} - {recordTitle}           [📝 Note] [📧 Activities] [📎 Files] [⚙] │
└───────────────────────────────────────────────────────────────────────┘
```

| Element           | Source                                   | Behavior                                        |
| ----------------- | ---------------------------------------- | ----------------------------------------------- |
| Form title        | `screenDefinition.title`                 | Static — set once from screen metadata          |
| Record title      | Controller's primary view current record | Reactive — updates on record navigation         |
| Note button       | Platform `RecordNotes` service           | Opens note attachment dialog for current record |
| Activities button | Platform `RecordActivities` service      | Opens task/event/email creation in new tab      |
| Files button      | Platform `RecordAttachments` service     | Opens file attachment dialog for current record |
| Settings button   | Platform `ScreenConfiguration` service   | Form personalization and configuration          |

> **Build status:** All title bar service buttons are ❌ not built. The `FormTitleBar` component must be created as platform chrome.

---

## 5. Form Toolbar Rendering

The Form Toolbar is rendered by the `FormToolbar` component (platform-level). Commands are **never hand-coded** in `view.vue` — they are declared in `commands.ts` and the platform renders them.

### Rendering Algorithm:

```
Input: commands[] from controller.getCommands()
       currentState from controller.getState()
       userFavorites from user preferences storage

1. Filter: visible commands = commands.filter(c => c.isVisible(currentState))
2. Partition:
   - standardCommands = [save, cancel, add, delete, copy, undo, nav]
   - expectedNext = commands.find(c => c.expectedNext(currentState))
   - favoriteCommands = commands.filter(c => userFavorites.has(c.key))
   - moreMenuCommands = remaining visible commands

3. Render:
   [Standard Buttons] | [Expected Next ▶ highlighted] | [Favorites] | [··· More]

4. Responsive:
   On resize, cascade commands from toolbar → More Menu (right to left)
```

### Standard Buttons (per Form Kind):

| Button                | Setup | Maintenance | Data Entry | Inquiry | Processing |
| --------------------- | ----- | ----------- | ---------- | ------- | ---------- |
| Save                  | ✅    | ✅          | ✅         | —       | —          |
| Cancel                | ✅    | ✅          | ✅         | —       | —          |
| Add                   | —     | ✅          | ✅         | —       | —          |
| Delete                | —     | ✅          | ✅         | —       | —          |
| Copy                  | —     | —           | ✅         | —       | —          |
| Undo                  | —     | —           | ✅         | —       | —          |
| First/Prev/Next/Last  | —     | ✅          | ✅         | —       | —          |
| Refresh               | —     | —           | —          | ✅      | ✅         |
| Process / Process All | —     | —           | —          | —       | ✅         |

### More Menu Rendering:

```
┌─────────────────────────────────┐
│ Processing          Activities  │  ← Category titles (bold)
│ ● Submit       ★    Create Task │  ← ● = expected next, ★ = favorite
│   Release            Create Note│
│   Void (greyed)                 │  ← greyed = isEnabled returns false
│                                 │
│ Other                           │
│   Print                         │
│   Recalculate                   │
└─────────────────────────────────┘
```

Multi-column layout when multiple categories exist. Single column on small screens.

> **Build status:** `FormToolbar` component is ❌ not built. AP currently renders commands manually in `view.vue`.

---

## 6. The Binding Layer

Components must never bind directly to raw data. They use the **Binding API** to inherit behavior from the controller.

### Binding Composables:

- `useField(key)`: Retrieves the memoized value, evaluates `readonly` against the State Machine and `FieldDefinition`, and exposes an `onChange` mutation.
- `useGrid(key)`: Retrieves a tabular subgraph. Grids do not fetch their own data; they are projections of the controller's data graph.
- `useCommand(key)`: Binds a button to a command. Automatically handles `disabled/hidden` states based on the state machine and command's `isVisible`/`isEnabled` predicates.

### View Constraints:

```vue
<!-- WRONG: View contains logic and direct mutation -->
<AppField :value="data.status" @update="save" :readonly="data.status === 'PAID'" />

<!-- RIGHT: View is pure projection via Binding API -->
<AppField v-bind="useField('status')" />
<AppButton v-bind="useCommand('release')" />
```

---

## 7. Side Panel Rendering & Contextual Binding

The Side Panel is rendered by the `AppSidePanel` component. It appears on the right edge of the Working Area as an icon strip.

### Rendering Rules:

```
┌────────────┐
│  Working   │ ┌──┐
│  Area      │ │📋│ ← Record Services (Notes/Files/Activities)
│            │ │📊│ ← Related Form (embedded screen)
│            │ │💬│ ← Activities history
│            │ └──┘
└────────────┘
```

### Contextual Binding:

The Side Panel is **always bound to the current record context**:

| Trigger                                    | Behavior                                                |
| ------------------------------------------ | ------------------------------------------------------- |
| Grid row selection (on list/inquiry forms) | Side panel refreshes with the selected row's record key |
| Record navigation (on data entry forms)    | Side panel refreshes with the navigated record          |
| Tab switch in panel                        | Active tab content reloads for current record           |

### Side Panel Contract:

```typescript
interface SidePanelConfig {
  tabs: SidePanelTab[]
}

type SidePanelTab =
  | { kind: 'local'; icon: string; component: Component; label: string } // Local content
  | { kind: 'screen'; icon: string; screenId: ScreenId; label: string } // Embedded form

// Context is injected automatically by the platform:
// provide('sidePanelContext', { recordKey: computed(() => controller.currentRecordKey) })
```

> **Build status:** `SidePanelContract` types exist. `RecordServicesMenu` is ❌ not built. Context-binding to grid selection is ❌ not built.

---

## 8. Screen Renderer Responsibilities

The ScreenRenderer is the platform component that assembles the full form chrome:

1. **Mount Title Bar**: Render `FormTitleBar` with screen title, record title, and service buttons.
2. **Mount Toolbar**: Render `FormToolbar` from controller's command registry.
3. **Mount Summary Area**: Render `AppTemplate` with the screen's layout template, populated with `AppFieldset` groups.
4. **Mount Tabs**: Render tab bar from screen definition.
5. **Mount Working Area**: Mount the form's `view.vue` as pure layout content.
6. **Mount Side Panel**: Render `AppSidePanel` with configured tabs.
7. **Instance Management**: Navigating away **deactivates** (keep-alive) rather than destroys the instance.

### Assembly Order:

```vue
<template>
  <div class="screen-instance">
    <FormTitleBar :screen="definition" :record="controller.currentRecord" />
    <FormToolbar :commands="controller.commands" :state="controller.state" />
    <AppTemplate :template="definition.layout.summaryTemplate">
      <!-- Summary fieldsets rendered from field definitions -->
    </AppTemplate>
    <TabBar :tabs="definition.tabs" v-model="activeTab" />
    <div class="details-area">
      <component :is="activeTabComponent" />
    </div>
    <AppSidePanel :config="definition.sidePanel" :context="controller.currentRecordKey" />
  </div>
</template>
```
