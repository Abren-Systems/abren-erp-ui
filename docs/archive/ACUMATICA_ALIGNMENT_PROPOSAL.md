---
title: 'Acumatica Alignment Proposal'
description: 'Structural, architectural, and system changes required to align Abren ERP UI with Acumatica Modern UI principles.'
tier: frontend
tags: [frontend, architecture, ux, acumatica]
---

# Acumatica Alignment Proposal

> **Status:** Proposed — Historical reference. Companion strategies have been consolidated into [ARCHITECTURE.md](./ARCHITECTURE.md) and [SCREEN_RUNTIME.md](./SCREEN_RUNTIME.md).
> **Sources reviewed:**
>
> - `/Users/yuma/Downloads/AcumaticaERP_UIDev.pdf` — Acumatica UI Developer Guide, 2026 R1, last updated 2026-03-15
> - `/Users/yuma/Downloads/AcumaticaERP_InterfaceGuide.pdf` — Acumatica End-User Interface Guide, 2026 R1, last updated 2026-03-15
> - `/Users/yuma/Downloads/AcumaticaERP_UIDevRef.pdf` — Acumatica UI Component Guide, 2026 R1, last updated 2026-03-15
>
> **Local references reviewed:** `docs/architecture/UX_ARCHITECTURE.md`, `docs/FIELD_SYSTEM.md`, `docs/architecture/ARCHITECTURE.md`, `src/shared/architecture/*`, shared field/grid/workspace components, AP focus/list screens.

## Executive Decision

Acumatica should not be treated as a visual theme. Its durable value is the **screen/form operating model**:

1. Every UI surface is a registered screen.
2. A screen is backed by a server-side business controller, a primary view, and one or more typed data views.
3. Layout is constrained by named templates, fieldsets, tabs, panels, and grid presets.
4. Actions are server/workflow-bound commands, not ad hoc button handlers.
5. Customization, localization, and testability are built into the screen definition.

The end-user guide adds a second architectural requirement: Acumatica is a **persistent working environment**. Search, recently viewed records, favorites, workspace menus, command favorites, saved filters, personalized table layouts, notes, files, activities, side panels, and system-wide UI configuration are not decorations. They are part of the operating system.

The UI Component Guide adds the missing middle layer: Acumatica components are formal contracts, not free-form widgets. Buttons, dialogs, fieldsets, tabs, tables, selectors, splitters, labels, captions, uploaders, notifications, and wizards all have naming conventions, caption rules, layout rules, configuration APIs, and personalization behavior.

Abren already has the right instincts: 4-layer modules, Field System primitives, workspaces, focus canvases, shared grids, and early `ScreenDefinition` types. The gap is that these are still mostly **page conventions**. To match Acumatica, we need to promote them into a **metadata-backed screen runtime, user workspace platform, and component contract catalog**.

## Acumatica Principles To Match

### 1. Screen As The Primary Unit

Acumatica organizes Modern UI source by screen ID and functional prefix, for example `GL/GL401000/GL401000.ts` and `GL401000.html`. The TypeScript screen class extends `PXScreen`, declares graph metadata, sets a primary view, and exposes data views.

**Abren target:** every business screen gets a stable screen ID, route binding, permission key, primary entity/view, controller, action list, layout schema, and test name.

### 2. Server-Backed View Model

Acumatica separates:

- HTML template: layout
- TypeScript screen/view classes: presentation logic and data view declarations
- Server graph: model and business behavior

**Abren target:** Vue SFCs should stop being the main source of truth for screen structure. A screen definition should declare data views and capabilities; Vue components should render those definitions through AppField, AppFieldset, AppTabs, DataGrid, AppSidePane, and AppDialog.

### 3. Form Types Are Explicit

The guide repeatedly distinguishes setup, data entry, processing, inquiry, and customized forms. Each has layout expectations:

- Setup and maintenance: `1-1`, larger labels, preferences/configuration.
- Transaction data entry: three-column summary, tabs, line grids, totals/highlight section on the right.
- Processing: selection/filter area plus read-only processing grid and processing dialog.
- Inquiry: parameter area plus read-only inquiry grid.

**Abren target:** replace the looser `Workboard / Workspace / Focus / Setup` grammar with an Acumatica-compatible screen taxonomy:

| Acumatica Form Type | Abren Screen Kind | Primary Purpose                                                |
| ------------------- | ----------------- | -------------------------------------------------------------- |
| Setup / Maintenance | `setup`           | Preferences, numbering, posting rules, governance              |
| Data Entry          | `dataEntry`       | Transaction/profile creation and editing                       |
| Processing          | `processing`      | Select many records, execute server action, show result dialog |
| Inquiry             | `inquiry`         | Read-only filtered analysis and drilldown                      |
| List / Workspace    | `workspace`       | Dense scanning, saved filters, navigation to data-entry focus  |
| Workboard           | `workboard`       | Cross-screen operational launchpad                             |

### 4. Layout Templates And Grid Presets

Acumatica uses named layout templates such as `7-10-7`, `17-17-14`, `1-1`, and grid presets such as `Primary`, `Inquiry`, `Processing`, `ReadOnly`, `Details`, `Attributes`, and `ShortList`.

**Abren target:** add first-class `AppTemplate` and `DataGridPreset` APIs. Pages should not hand-place fieldsets with arbitrary grid classes.

### 5. Actions Are Commands

Acumatica actions come from the graph/workflow and appear on the More menu by default; explicit TypeScript action definitions are needed only when placing actions elsewhere.

**Abren target:** actions should come from a `ScreenAction[]` / command registry produced by application composables or backend metadata. UI renders commands; it does not decide state transitions inside SFCs.

### 6. Customization And Extensions Are Expected

Acumatica has extension files for features, dialogs, tabs, and customizations. The base screen stays intact while extensions add structure.

**Abren target:** define a screen extension mechanism before the app grows: modules can contribute tabs, fields, actions, trace sections, and grid columns through typed extension points, gated by feature flags and permissions.

### 7. Testability And Localization Are Part Of UI Architecture

Acumatica names containers for wrappers/tests and treats localization as a first-class concern across TypeScript/HTML/DAC/application messages.

**Abren target:** every screen definition must include stable test IDs and localization keys for titles, fields, tabs, actions, empty states, and validation messages.

### 8. The Shell Is A Working Environment

The end-user guide defines a persistent shell:

- home/menu entry point
- global search
- recently viewed records
- company and branch selector
- info/user/business-date area
- help
- main menu with favorites, workspaces, More Items, configuration, collapse/expand
- working area that can show forms, reports, or dashboards

**Abren target:** `AuthenticatedLayout` should become an Acumatica-style shell with global command/search, recent records, tenant/company/branch context, help, favorites, and configurable workspaces as first-class platform services.

### 9. Search Preserves Work

Acumatica search opens as a workspace over the current page and preserves the previous form state. Search spans menu items, form/report titles and IDs, transactions/profiles, help topics, and files, with access-right filtering.

**Abren target:** global search must be an overlay workspace with scoped tabs and should not destroy the active screen instance or unsaved draft state.

### 10. Personalization Is Layered

Acumatica has three layout layers:

- default product layout
- administrator/system-wide layout
- user-personalized layout

Users can reorder tabs, hide/show tabs, configure table columns, resize/reorder columns, and collapse/expand sections. Administrators can apply layouts to all users or selected users and optionally override personal layouts.

**Abren target:** screen definitions need a personalization merge model:

```text
Base ScreenDefinition
  + System ScreenConfiguration
  + Role/User ScreenConfiguration
  + Tenant Extensions
  = Runtime Screen Model
```

### 11. Forms Include Record Services

Acumatica form title bars include record-oriented capabilities: notes, activities, files, favorites, get link, audit history, notifications, access rights, profiler/trace, and related tooling.

**Abren target:** Focus/data-entry screens should expose standardized record services instead of module-specific trace-only drawers.

### 12. Commands Have Favorites, Categories, And Expected Next Action

Acumatica's More menu groups commands by category. Users can star commands to duplicate them onto the toolbar. A likely next command can appear as a highlighted toolbar action while unavailable commands remain visible but disabled in the More menu.

**Abren target:** command metadata must support category, visible/disabled distinction, expected next command, user favorites, responsive overflow into More, and audit/confirmation requirements.

### 13. Tables Are Personalized Work Surfaces

Acumatica tables support column configuration, search, simple filters, quick filters, advanced filters, shared filters, default filters, row shortcut menus, import/export, attachments/notes on detail rows, pagination footer, fit-to-screen, and administrator-shared column configurations.

**Abren target:** `DataGrid` must become a personalized table platform, not only a TanStack table wrapper.

### 14. Reports Are Parameterized Screens

Reports have parameter forms, sorting/filtering tabs, mailing/printing settings, templates, default/shared templates, generated report toolbar, export, print, send, and parameter/report toggling without losing changes.

**Abren target:** add `report` as a screen kind, with report templates handled similarly to saved filters.

### 15. Components Have Formal Contracts

Acumatica component behavior is constrained by component type, ID prefix, caption convention, placement rules, sizing rules, and configuration metadata. For example, buttons use semantic verb captions and action placement rules, dialogs use standard panel widths and footer buttons, tabs use noun-phrase labels and should not exist alone, and grids require a preset/configuration.

**Abren target:** every shared business component needs a documented contract that includes ID convention, label convention, allowed parent layouts, required metadata, personalization behavior, and test role.

### 16. Field Rendering Is Control-Aware

Acumatica fields are not just labels and values. Backend metadata and control configuration determine whether a field renders as a combo box, selector, radio group, checkbox, date/time editor, currency editor, mask editor, upload control, or custom editor. UI code stays simple because field/control decorators carry the detail.

**Abren target:** expand `FieldDefinition` into `FieldControlDefinition` so the Field System can select and configure controls from metadata instead of per-screen template decisions.

### 17. Tables Are Grid Contracts, Not Table Components

Acumatica grids define preset, toolbar behavior, search/filter behavior, footer/pager behavior, note/file support, import/export, shortcut menus, column permissions, column links, alignment, visibility, width, filtering, sorting, and personalization.

**Abren target:** `DataGrid` needs a required grid contract and column contract. TanStack Table remains the engine, but Abren owns ERP semantics such as grid preset, column config, row services, filters, export/import, and persisted layout.

### 18. Component IDs Are Part Of The API

Acumatica uses predictable IDs such as `button*`, `grid*`, `tabs*`, `tab*`, `fs*`, `splitter-*`, and `splitPane*`. These names support testing, customization, and system-wide configuration.

**Abren target:** component IDs and container names must be generated from screen metadata and treated as stable API, not incidental DOM attributes.

## Current Abren Evaluation

### Strong Alignment

- The 4-layer module architecture maps well to Acumatica's separation of graph/model, view classes, and templates.
- The Field System is conceptually close to Acumatica's field tag: field identity drives rendering, not one-off HTML.
- `PaymentRequestsListPage.vue` already models workspace + grid + filter selector + docked trace pane.
- `PaymentRequestFocus.vue` already models summary area + tabs + line grid + trace drawer.
- `DataGrid` centralization is the right foundation for Acumatica-style grid presets.
- `src/shared/architecture/screen.types.ts`, `command.types.ts`, and `controller.types.ts` show the beginning of a screen runtime.
- `AuthenticatedLayout`, `AppTopPane`, and `AppSidebar` provide the skeleton needed for Acumatica's top pane, menu, tenant context, and working area.
- Current grid footer/filter components can evolve into Acumatica-style filtering areas and table footers.
- Shared primitives already cover many Acumatica component categories: fieldsets, fields, tabs, dialogs, side panes, buttons, menus, badges, and grids.

### Gaps

- Screen definitions are not active. Current routing still points directly to SFC pages.
- Screen types use `any`, which conflicts with strict TypeScript and weakens the contract.
- There is no formal screen ID registry or functional-area numbering convention.
- There is no persisted screen-instance workspace, so global search/recently viewed/help overlays cannot safely preserve unsaved work.
- Recently viewed records, favorite records, favorite screens, and favorite commands are not platform services.
- Main menu/workspace configuration is static module metadata, not user/system configurable navigation.
- Layout templates are embedded as component props or raw Tailwind classes, not named Acumatica-style templates.
- Grid behavior is configured per component usage, not through a preset API.
- DataGrid lacks Acumatica-level personalization: saved personal/shared filters, quick filters, advanced filter editor, column configuration, fit-to-screen, accessibility/tab-stop configuration, shortcut menu, and admin-shared table layouts.
- Actions are often computed inside pages, not declared by screen metadata or backend capabilities.
- Commands do not yet have categories, favorite-command promotion, expected-next-action highlighting, or responsive More-menu overflow.
- Some business screens and drawers still use raw `div class="grid"` layouts and raw spans for data display.
- Setup, processing, and inquiry forms are not first-class screen kinds.
- Reports are not modeled as first-class parameterized screens with templates.
- Record services such as notes, files, activities, links, audit history, and notifications are not standardized on form title bars.
- There is no component contract registry for naming, captions, allowed placement, personalization, and test roles.
- Field rendering lacks Acumatica-style control metadata for selectors, combo boxes, radio groups, masks, uploads, and currency/date/time editors.
- Component ID conventions are not enforced, which weakens future testing and customization.
- Dialogs, menus, tabs, splitters, and table toolbars are not driven by declarative component contracts.
- Customization/extension points are not formalized.
- Localization and test container naming are not enforced by screen definition.

## Proposed Target Architecture

### 1. Add A Screen Registry

Create `src/app/screens/` and promote screens from route-only pages into registered definitions.

```ts
export interface ScreenDefinition<TEntity, TContext, TViews extends ScreenViews> {
  id: ScreenId
  moduleId: ModuleId
  kind: ScreenKind
  titleKey: I18nKey
  primaryView: keyof TViews
  route: ScreenRoute
  permissions: ScreenPermission[]
  views: TViews
  layout: ScreenLayoutDefinition<TViews>
  actions: ScreenActionDefinition<TEntity>[]
  test: ScreenTestContract
}
```

The router should become a consumer of screen definitions, not the source of screen structure.

### 2. Implement Acumatica-Like View Definitions

Add typed view descriptors:

```ts
type ScreenViewKind = 'single' | 'collection' | 'report'

interface ScreenView<TEntity> {
  name: string
  kind: ScreenViewKind
  containerName: string
  queryKey: readonly unknown[]
  fields: readonly FieldDefinitionRef<TEntity>[]
}
```

This maps to Acumatica's `createSingle`, `createCollection`, and `viewInfo({ containerName })`.

### 2.1 Add Persistent Screen Instances

Promote `Workspace` and `ScreenInstance` from type sketches to runtime services:

```ts
interface ScreenInstance<TContext> {
  instanceId: ScreenInstanceId
  screenId: ScreenId
  context: TContext
  dirty: boolean
  lastAccessedAt: string
  title: string
}
```

This enables Acumatica-style search/help/recently-viewed overlays without destroying the current screen.

### 3. Add `AppTemplate`

Introduce a layout primitive equivalent to `qp-template`.

Supported templates:

- `1`
- `1-1`
- `1-1-1`
- `2-1`
- `1-2`
- `7-10-7`
- `17-17-14`
- `17-14-17`
- `14-17-17`
- `17-7`
- `7-17`
- `17-31`

`AppFieldset` stays the field grouping primitive, but `AppTemplate` becomes the slot and width authority.

### 4. Add `DataGridPreset`

Extend `DataGrid` with a required preset for business grids:

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

Each preset controls toolbar merge behavior, search/filter visibility, footer visibility, insert/delete permissions, row selection, density, caption rules, and persistence defaults.

### 5. Build Standard Screen Shells

Create renderer shells for:

- `SetupScreen`
- `DataEntryScreen`
- `ProcessingScreen`
- `InquiryScreen`
- `WorkspaceScreen`
- `ReportScreen`

These should compose existing Abren primitives instead of replacing them. For example, `DataEntryScreen` renders title bar, summary template, tabs, detail grids, action toolbar, trace drawer slot, and confirmation dialog slot.

### 6. Build The Acumatica Shell Services

Add platform services for:

- global search workspace with tabs: menu/screens, records, help, files
- recently viewed records with record types, favorite records, and scoped search
- favorites for screens, records, filters, report templates, and commands
- tenant/company/branch selector with search and access filtering
- help overlay with screen-specific help hooks
- business date display/change flow

### 7. Move Actions Out Of Pages

Promote the local `ScreenAction` pattern into `src/shared/architecture/actions.types.ts` and make actions available from:

- backend capability metadata, when available
- application composable state-machine projection, as an interim step

SFCs should render actions and emit intent; they should not decide which transition is allowed.

Action metadata should include:

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

### 8. Add Screen Extensions

Add extension points:

```ts
interface ScreenExtension<TViews> {
  screenId: ScreenId
  fields?: FieldExtension<TViews>[]
  tabs?: TabExtension<TViews>[]
  actions?: ActionExtension[]
  traceSections?: TraceExtension[]
  gridColumns?: GridColumnExtension<TViews>[]
}
```

This gives us an Acumatica-like path for feature-specific fields, dialogs, tabs, and tenant customizations without editing core screens.

### 9. Add Personalization And Configuration Store

Create a persisted configuration model:

```ts
interface ScreenConfiguration {
  screenId: ScreenId
  scope: 'user' | 'role' | 'tenant' | 'system'
  tabs?: TabConfiguration[]
  sections?: SectionConfiguration[]
  grids?: GridConfiguration[]
  commands?: CommandConfiguration[]
  filters?: SavedFilter[]
  updatedAt: string
}
```

This backs tab reorder/hide/show, section collapse/hide/reorder/rename, table column visibility/order/width/tab accessibility, saved personal/shared/default filters, favorite commands, system-wide layout application, and import/export of screen configuration.

### 10. Make Localization And Test IDs Mandatory

Every screen definition must provide:

- `titleKey`
- `field.labelKey`
- `tab.labelKey`
- `action.labelKey`
- `emptyState.messageKey`
- `test.containerName`
- `test.viewNames`
- `test.actionNames`

This aligns with Acumatica's container naming and localization model.

### 11. Standardize Record Services

Add a shared `RecordServicesMenu` for data-entry and class/profile screens:

- notes
- files
- activities
- audit history
- get link
- notifications/business events, when supported
- access rights, when authorized
- trace/profiler, in development/admin contexts

### 12. Add A Component Contract Registry

Create `src/shared/architecture/component-contract.types.ts` and a registry for business UI primitives.

```ts
interface ComponentContract {
  type: string
  idPrefix: string
  labelConvention: 'verb' | 'nounPhrase' | 'question' | 'none'
  allowedIn: readonly string[]
  configSchema: unknown
  personalization: readonly ('hide' | 'reorder' | 'resize' | 'collapse' | 'favorite')[]
  testRole: string
}
```

This registry should cover buttons, command menus, dialogs, fieldsets, collapsible areas, tabs, splitters, selectors, uploads, notifications, record title bars, and grids.

### 13. Expand Field And Column Metadata

Make fields and grid columns control-aware:

```ts
interface FieldControlDefinition<TEntity> {
  field: keyof TEntity
  labelKey: I18nKey
  controlType: FieldControlType
  controlConfig?: FieldControlConfig
  state?: FieldStateRule<TEntity>
  layoutHints?: FieldLayoutHints
}

interface GridColumnDefinition<TEntity> {
  field: keyof TEntity
  labelKey: I18nKey
  columnConfig: GridColumnConfig
  linkCommand?: string
}
```

This replaces scattered template-level decisions with Acumatica-style metadata for selectors, combo boxes, radio groups, checkboxes, masks, rich text, uploads, date/time, currency, links, and column behavior.

## Migration Plan

### Phase 1: Contract Hardening

- Replace `any` in `src/shared/architecture/*` with generics and `unknown`.
- Add `ScreenId`, `ScreenKind`, `ScreenView`, `ScreenLayoutDefinition`, `DataGridPreset`, `ComponentContract`, `FieldControlDefinition`, and `GridColumnDefinition` types.
- Add `ScreenInstance` runtime store with dirty-state preservation.
- Add lint rules or architectural checks for raw field display and raw business-screen grid layout.
- Document screen ID convention. Recommended format: `{AREA}{TYPE}{NUMBER}`, such as `AP301000`, where `10xxxx` setup, `30xxxx` data entry, `40xxxx` inquiry, and `50xxxx` processing.

### Phase 2: Renderer Primitives

- Build `AppTemplate`.
- Extend `DataGrid` with presets.
- Add component contract registry entries for fieldsets, buttons, dialogs, tabs, menus, grids, selectors, and splitters.
- Add metadata-driven field/control rendering and grid column configuration.
- Add `ScreenToolbar`, `ScreenTitleBar`, `ScreenSummary`, `ScreenTabs`, and `ScreenActionRenderer`.
- Add responsive `MoreMenu` with command categories and favorite-command promotion.
- Map existing `AppFieldset`, `AppField`, `AppTabs`, `AppSidePane`, and `DataGrid` into these shells.

### Phase 3: Shell And Table Platform

- Build global search workspace.
- Build recently viewed and favorite records.
- Build configurable menu/workspace model.
- Add saved filters, quick filters, advanced filter model, column configuration, and user/system table layout persistence.

### Phase 4: Pilot Screens

Convert these first:

- `PaymentRequestsListPage.vue` -> `AP3010PL` workspace/list screen.
- `PaymentRequestFocus.vue` -> `AP301000` data-entry screen.
- `LedgerSettingsPage.vue` or tax setup pages -> setup screen.
- A future batch approval/payment execution page -> processing screen.
- Journal entry list or cashflow query -> inquiry screen.
- First report form -> report screen.

### Phase 5: Extension And Localization

- Add typed screen extensions.
- Introduce i18n keys and test container contracts.
- Move user/tenant configurable labels, visibility, and optional tabs into screen metadata.

### Phase 6: Backend Metadata Integration

- Have backend expose state, fields, permissions, workflow actions, validation, and visibility metadata.
- Frontend screen definitions become mostly static layout + renderer contracts.
- Runtime merges backend metadata, local module definitions, and tenant extensions.

## Required System Changes

1. **Routing:** routes load registered screens; direct page registration becomes legacy-only.
2. **Module exports:** each module exports `screens` in addition to routes/menu items.
3. **Shell services:** global search, recently viewed, favorites, company/branch selector, help, business date, and user menu become platform services.
4. **Data layer:** application composables expose view descriptors and command capabilities.
5. **Field System:** expand from display registry to field definition metadata with labels, editor hints, lookup references, required/readonly state, and localization keys.
6. **Grid System:** replace per-page ad hoc grid behavior with presets, personalization, saved/shared filters, and column configuration.
7. **Component Contract System:** define ID prefixes, label conventions, allowed placement, configuration schema, personalization, and test roles for shared business components.
8. **Command System:** introduce categories, expected-next-action highlighting, favorite commands, disabled-but-visible commands, and responsive overflow.
9. **Form System:** align TanStack Form with screen views and field metadata.
10. **Report System:** add parameterized report screens with templates, sorting/filtering, generated report toolbar, export/print/send.
11. **Record Services:** standardize notes, files, activities, links, audit history, and notifications.
12. **Testing:** Playwright/component tests target screen/view/container IDs.
13. **Customization:** tenant/feature extensions register against screen IDs, not route component internals.
14. **Governance:** add CI checks for business-screen raw layout/data display violations.

## Design Principle Updates

Adopt this as the governing principle:

> Abren screens are Acumatica-style ERP forms rendered through Abren-owned Vue primitives.

Practical implications:

- Stop designing new screens as bespoke pages.
- Do not add one-off layouts where a named screen template can express the structure.
- Do not add one-off grid behavior where a preset fits.
- Do not add shared business components without a component contract: ID convention, label convention, configuration schema, personalization, and test role.
- Do not compute workflow actions in templates.
- Do not treat setup, processing, and inquiry screens as ordinary list/detail pages.
- Do not treat search, recently viewed, favorites, filters, reports, or table personalization as secondary features.
- Do not postpone localization, test IDs, or customization points.

## Priority Recommendation

The first architectural move should be **not** a visual redesign. It should be the **Screen Runtime Foundation**:

1. Harden `src/shared/architecture/*`.
2. Introduce `AppTemplate`.
3. Introduce `ComponentContractRegistry`.
4. Introduce `DataGridPreset` and `GridColumnDefinition`.
5. Add persistent screen instances.
6. Register `PaymentRequestFocus` and `PaymentRequestsList` as pilot screens.
7. Build the first slice of Acumatica working-environment services: global search overlay, recently viewed records, favorite screens/records, and saved grid filters.

Once those are in place, the Acumatica structure becomes enforceable across the entire system instead of depending on developer memory.
