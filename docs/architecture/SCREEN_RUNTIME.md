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
        -> Title Bar Chrome (FormTitleBar | ListTitleBar — by ScreenKind)
        -> FormToolbar (command rendering — form kinds only)
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
| `PL`      | **Primary List** | `primaryList` | Paired list/inquiry for data entry forms  | `AP3010PL` |
| `40`      | **Inquiry**      | `inquiry`     | Read-only analytical grids                | `AP401000` |
| `50`      | **Processing**   | `processing`  | Bulk processing screens (deferred)        | `AP501000` |
| `60`      | **Report**       | `report`      | Formatted printable reports               | `AP601000` |

---

## 3. Controller Authority (The PXGraph)

The Screen Controller is the absolute authority for a form's behavior. The View (`view.vue`) is a pure **Projection** — it has no logic and simply renders the `ScreenModel` produced by the platform's resolution engine.

### The Resolver as Semantic Compiler

The `resolveScreenModel` function acts as a **Semantic Compiler**. It takes raw inputs from the module (commands, capabilities, field definitions) and the platform (kind, state policies) and compiles them into a single, JSON-serializable execution contract. This ensures:

- **Determinism**: The same inputs always produce the same UI projection.
- **Traceability**: UI states can be snapshotted, replayed, and audited.
- **Isolation**: The View is shielded from the complexity of business rule evaluation.

### Rules:

1. **Owns Data Access**: The controller fetches data via the module's infrastructure layer. No external hooks passed in.
2. **Owns Command Registry**: All commands are declared as data objects in `commands.ts` and registered in the controller.
3. **Grid Authority**: The controller owns the initialization and orchestration of `useDataGrid()`. The View merely binds to `ctrl.model.value.ui.grids`.
4. **Projection Purity**: The View (`view.vue`) must exclusively consume the resolved `ScreenModel`. It is **banned** from accessing `ctrl.state` or `ctrl.commands` directly. The UI does not decide truth; the runtime derives truth.
5. **Dual-Layer State Machine**: The controller evaluates permissions based on UIState (`NEW`, `VIEW`, `EDIT`) and DomainState (`DRAFT`, `APPROVED`).
6. **Declarative UI Projection**: The frontend NEVER orchestrates transitions. The controller interprets a declarative `ScreenStatePolicy`.
7. **Mutation Guards**: All mutations flow through `useField` and are strictly blocked if the `ScreenStatePolicy` dictates readonly.

---

## 4. Working Area Chrome (Title Bar + Toolbar)

The Working Area chrome is **not hand-coded per screen** — the platform selects the correct chrome components based on `ScreenKind`. This is a fundamental Acumatica distinction: list/inquiry screens have lightweight chrome (no record context), while data-entry and maintenance screens have full record-aware chrome.

### 4.1 Chrome Selection by Screen Kind

The ScreenRenderer assembles chrome based on the `ScreenKind` declared in the screen definition:

| Chrome Component      | Setup | Maintenance | Data Entry | Primary List | Inquiry  | Processing | Dashboard |
| --------------------- | ----- | ----------- | ---------- | ------------ | -------- | ---------- | --------- |
| **FormTitleBar**      | ✅    | ✅          | ✅         | —            | —        | —          | —         |
| **ListTitleBar**      | —     | —           | —          | ✅           | ✅       | ✅         | ✅        |
| **FormToolbar**       | ✅    | ✅          | ✅         | —            | —        | —          | —         |
| **FormBanner**        | ✅    | ✅          | ✅         | —            | —        | —          | —         |
| **Record Navigation** | —     | ✅          | ✅         | —            | —        | —          | —         |
| **Record Services**   | —     | ✅          | ✅         | —            | —        | —          | —         |
| **Side Panel**        | —     | Optional    | Optional   | Optional     | Optional | —          | —         |

> [!IMPORTANT]
> **FormTitleBar ≠ ListTitleBar.** `FormTitleBar` renders back navigation, a record title (e.g., "PR-0042"), and record-level service buttons (Notes, Files, Activities, Settings). `ListTitleBar` renders only the screen title — no back button, no record context, no service strip. List screens are top-level workspace destinations, not drill-down targets.

### 4.2 FormTitleBar (Record-Context Chrome)

Used by: `setup`, `maintenance`, `dataEntry`

The Form Title Bar provides record-level context and record-level service buttons:

```
┌───────────────────────────────────────────────────────────────────────┐
│ [←] {screenDefinition.titleKey}                                       │
│     {recordId} — {recordTitle}       [📝 Note] [📧 Activities] [📎 Files] [⚙] │
└───────────────────────────────────────────────────────────────────────┘
```

| Element           | Source                                   | Behavior                                        |
| ----------------- | ---------------------------------------- | ----------------------------------------------- |
| Back button       | `backRoute` prop (PL screen)             | Navigates to the paired list screen             |
| Form title        | `screenDefinition.titleKey`              | Static — set once from screen metadata          |
| Record title      | Controller's primary view current record | Reactive — updates on record navigation         |
| Note button       | Platform `RecordNotes` service           | Opens note attachment dialog for current record |
| Activities button | Platform `RecordActivities` service      | Opens task/event/email creation in new tab      |
| Files button      | Platform `RecordAttachments` service     | Opens file attachment dialog for current record |
| Settings button   | Platform `ScreenConfiguration` service   | Form personalization and configuration          |

> **Title Bar buttons ≠ Toolbar buttons.** The Toolbar has document-level commands (Save, Release). The Title Bar has record-level attachments (Notes, Files, Activities).

> **Build status:** `FormTitleBar` component is ✅ built. Record service buttons are ❌ not built (placeholder icons shown).

### 4.3 ListTitleBar (Workspace-Destination Chrome)

Used by: `inquiry`, `primaryList`, `processing`, `dashboard`

The List Title Bar is intentionally minimal — list screens are top-level workspace destinations, not record-context forms:

```
┌───────────────────────────────────────────────────────────────────────┐
│ {screenDefinition.titleKey}                            [slot:actions] │
└───────────────────────────────────────────────────────────────────────┘
```

| Element      | Source                      | Behavior                                   |
| ------------ | --------------------------- | ------------------------------------------ |
| Screen title | `screenDefinition.titleKey` | Static                                     |
| Actions slot | Named slot `#actions`       | Optional — for screen-level action buttons |

**What ListTitleBar does NOT have:**

- No back button (lists are not drill-down targets)
- No record title (no single-record context)
- No record services (Notes, Files, Activities belong to records, not lists)
- No separator or record identifier

> **Build status:** `ListTitleBar` component is ✅ built.

### 4.4 Chrome Assembly in ScreenRenderer

The `ScreenRenderer` is the platform component that selects and mounts the correct chrome:

```typescript
// Simplified ScreenRenderer chrome selection logic
const isFormKind = ['setup', 'maintenance', 'dataEntry'].includes(screen.kind)
const isListKind = ['inquiry', 'primaryList', 'processing', 'dashboard'].includes(screen.kind)

// FormTitleBar + FormToolbar + FormBanner for record-context screens
// ListTitleBar for list/inquiry screens (no toolbar, no banner)
```

---

## 5. Form Toolbar Rendering

The Form Toolbar is rendered by the `FormToolbar` component (platform-level). Commands are **never hand-coded** in `view.vue` — they are declared in `commands.ts` and the platform renders them.

### Rendering Algorithm:

```
Input: ScreenModel from controller.model

1. Access actions: model.ui.actions
2. Access expectedNext: model.ui.actions.expectedNext (already filtered and projected)
3. Partition:
   - standardCommands = model.ui.actions.primary
   - secondaryActions = model.ui.actions.secondary (to be grouped in More Menu)
```

### Standard Buttons (per Form Kind):

The platform automatically injects standard actions (Save, Cancel, Add) into the `primary` actions array based on the `FormKind` and domain capabilities (e.g., `canEdit`).

4. Render:
   [Standard Buttons] | [Expected Next ▶ highlighted] | [Favorites] | [··· More]

5. Responsive:
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
│ Processing Activities │ ← Category titles (bold)
│ ● Submit ★ Create Task │ ← ● = expected next, ★ = favorite
│ Release Create Note│
│ Void (greyed) │ ← greyed = isEnabled returns false
│ │
│ Other │
│ Print │
│ Recalculate │
└─────────────────────────────────┘

````

Multi-column layout when multiple categories exist. Single column on small screens.

> **Build status:** `FormToolbar` component is ✅ built and consumes the `ScreenModel` projection. AP and other modules use it via `ScreenRenderer`.

---

## 6. The Binding Layer

Components must never bind directly to raw data. They use the **Binding API** to inherit behavior from the controller.

### Binding Composables:

- `useField(key)`: Retrieves the memoized value, evaluates `readonly` and `required` states against the **ScreenModel's field overrides**, and exposes an `onChange` mutation.
- `useGrid(key)`: Retrieves a tabular subgraph. Grids do not fetch their own data; they are projections of the controller's data graph.
- `useCommand(key)`: Binds a button to a command using the **CommandProjection** metadata (visible, enabled, reason).

### View Constraints:

```vue
<!-- WRONG: View contains logic and direct mutation -->
<AppField :value="data.status" @update="save" :readonly="data.status === 'PAID'" />

<!-- RIGHT: View is pure projection via Binding API -->
<AppField v-bind="useField('status')" />
<AppButton v-bind="useCommand('release')" />
````

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
