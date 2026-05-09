---
title: 'Acumatica Alignment: The Rosetta Stone'
tier: 1
tags: [architecture, acumatica, mental-model, screen-runtime, ui-hierarchy]
version: '1.0'
last_updated: '2026-05-06'
---

# Acumatica Alignment: The Rosetta Stone

> **Purpose:** Map every Acumatica Modern UI concept to its Abren ERP equivalent. This document is the definitive reference for the mental model that governs all UI architecture decisions.
>
> **Source Authority:** Acumatica ERP End-User Guide + T290 Modern UI Developer Course + xRP Framework Documentation.
>
> **Rule:** We don't do what we did not document. Every UI pattern must trace back to a concept in this document.

---

## 1. The Core Insight: Everything is a Graph

Acumatica's architecture is built around one fundamental concept: **PXGraph** (Business Logic Controller). Every form is backed by exactly one Graph. The Graph is:

- The **single source of behavior** for that form
- The **owner of all Data Views** (queries that expose data to the UI)
- The **command dispatcher** (Save, Release, Approve — all live here)
- The **state machine host** (which actions are available depends on the current record's status)

```
┌─────────────────────────────────────────────────────────┐
│                     PXGraph (BLC)                       │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Data Views  │  │   Commands   │  │ State Machine │  │
│  │  (PXSelect)  │  │   (Actions)  │  │  (Workflow)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │
│         │                 │                 │           │
│    Primary View      Save/Release      HOLD → OPEN     │
│    Detail Views      Approve/Void      OPEN → RELEASED │
│    Lookup Views      Cancel/Print      etc.            │
└────────────────────────┬────────────────────────────────┘
                         │ binds to
                    ┌────▼─────┐
                    │   Form   │ (UI is a pure renderer)
                    │  (View)  │
                    └──────────┘
```

### Abren Equivalent

| Acumatica                 | Abren                                                | File                |
| ------------------------- | ---------------------------------------------------- | ------------------- |
| `PXGraph`                 | `useScreenController()` + screen-specific controller | `controller.ts`     |
| `PXAction<T>`             | `ScreenCommand` declarative data object              | `commands.ts`       |
| `PXSelect<T>` (Data View) | `ScreenDefinition.views`                             | `screen.ts`         |
| Workflow Engine           | `ScreenStateMachine` (UI) + backend domain status    | `controller.ts`     |
| DAC (Data Access Class)   | Domain types with branded IDs                        | `domain/*.types.ts` |
| BQL Query                 | TanStack Query composable                            | `application/`      |

---

## 2. The UI Hierarchy (3 Persistent Regions + Center Area State Machine)

Acumatica's UI has **3 persistent regions** and a **center area that transitions between states**. The Workspace and Working Area are **NOT** simultaneous regions — they are mutually exclusive states of the same center area.

### Physical Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TOP PANE (always visible)                                               │
│ [🏠Home] [🔍Search...        ] [🕐Recent] [⏱Timer] [Company▾] [Date▾] [?] [👤User▾] │
├──────────────┬──────────────────────────────────────────────────────────┤
│ MAIN MENU    │           CENTER AREA                                    │
│ (left rail)  │  (content changes based on navigation state)             │
│              │                                                          │
│ ┌──────────┐ │  State A: WORKSPACE VIEW                                │
│ │ Finance  │◄┤  ┌─────────────────────────────────────────────┐        │
│ │ Distrib. │ │  │ Tiles & links to forms, reports, dashboards │        │
│ │ Organize │ │  │ Grouped by category. User can pin favorites.│        │
│ │          │ │  └─────────────────────────┬───────────────────┘        │
│ └──────────┘ │                            │ click a link               │
│              │                            ▼                            │
│              │  State B: WORKING AREA                    ┌───────────┐ │
│              │  ┌──────────────────────────────────────┐  │ SIDE      │ │
│              │  │ Form / Report / Dashboard / Help     │  │ PANEL     │ │
│              │  │ (with its own Title Bar, Toolbar,    │  │ (context- │ │
│              │  │  Summary, Tabs, Details — see §5)    │  │  ual to   │ │
│              │  └──────────────────────────────────────┘  │  record)  │ │
│              │                                            └───────────┘ │
└──────────────┴──────────────────────────────────────────────────────────┘
```

### The Center Area State Model

The center area is a **state machine** with two mutually exclusive states:

| State | Name               | Triggered By                                                    | Content                                                   | Side Panel?                            |
| ----- | ------------------ | --------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------- |
| **A** | **Workspace View** | Clicking a module in the Main Menu                              | Tiles and categorized links to forms, reports, dashboards | **No**                                 |
| **B** | **Working Area**   | Clicking a link/tile in the Workspace, or direct URL navigation | A form, report, dashboard, or help topic                  | **Yes** — contextual to current record |

The transition flow:

```
Main Menu click → Center Area enters WORKSPACE VIEW (tiles/links)
                        │
                  Link click
                        │
                        ▼
              Center Area enters WORKING AREA (form/report/dashboard)
                        │
                        ├── Side Panel appears (contextual to record)
                        └── Form chrome loads (Title Bar, Toolbar, Summary, etc.)
```

### The 3 Persistent Regions

| Region          | Acumatica Definition                                                                                            | Abren Equivalent                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Top Pane**    | Persistent chrome bar with Home, Search, Recently Viewed, Timer, Company/Branch, Business Date, Help, User Menu | `AppTopBar` in `AuthenticatedLayout`                 |
| **Main Menu**   | Left rail with module entries; expandable, collapsible, or minimizable to a Menu button in Top Pane             | `AuthenticatedLayout` sidebar                        |
| **Center Area** | Content region transitioning between Workspace View (navigation) and Working Area (form content)                | Vue Router `<RouterView>` + `WorkspacePanel` overlay |

### The 2 Center Area States

| Element            | State          | Acumatica Definition                                               | Abren Equivalent                     |
| ------------------ | -------------- | ------------------------------------------------------------------ | ------------------------------------ |
| **Workspace View** | A (navigation) | Categorized links/tiles to forms, reports, dashboards of a module  | `WorkspacePanel` component           |
| **Working Area**   | B (content)    | Form/report/dashboard content, with optional contextual Side Panel | `<RouterView>` + `SidePanelContract` |

> **Workspace ≠ separate region.** The Workspace View and Working Area are **mutually exclusive states** of the same center area. When viewing a Workspace, there is no Working Area. When working in a form, the Workspace is dismissed. The Side Panel only exists in the Working Area state.

### Top Pane Anatomy (8 Elements)

| #   | Element              | Purpose                                                                          | Abren Status          |
| --- | -------------------- | -------------------------------------------------------------------------------- | --------------------- |
| 1   | **Home Button**      | Company logo; navigates to configurable home page                                | ✅ Logo/home link     |
| 2   | **Search Box**       | Global search — records, forms, reports                                          | ❌ Phase 2            |
| 3   | **Recently Viewed**  | Overlay of recently created/opened records from data entry and maintenance forms | ❌ Phase 2            |
| 4   | **Timer**            | Project task time tracking (green = running, yellow = paused)                    | ❌ N/A (no PM module) |
| 5   | **Company & Branch** | Switch between accessible companies and branches                                 | ✅ Tenant selector    |
| 6   | **Business Date**    | Current business date/time; calendar to override (default date for new records)  | ❌ **Critical**       |
| 7   | **Open Help**        | Context-sensitive help links for the current Working Area content                | ❌ Phase 2            |
| 8   | **User Menu**        | Tenant, username, email, last sign-in; User Profile and Sign Out                 | ✅ User dropdown      |

> **Business Date is critical for a financial ERP.** All transaction records use the Business Date as their default date — not `new Date()`. This is a user-overridable system concept.

### Workspace Anatomy (Center Area State A)

The Workspace is a navigation-centric view that appears when a module is selected in the Main Menu. It consists of the following elements:

| Element                  | Purpose                                                                         | Abren Status      |
| ------------------------ | ------------------------------------------------------------------------------- | ----------------- |
| **Module Title**         | Large header with the module name (e.g., "Finance").                            | ❌ WorkspacePanel |
| **Add to Favorites**     | Star icon next to title to pin/unpin the module workspace.                      | ❌ WorkspacePanel |
| **Workspace Search**     | Local search input to filter links within the current workspace.                | ❌ WorkspacePanel |
| **Show All Toggle**      | Toggle between "Quick Links" (curated) and "All Items" (full module menu).      | ❌ WorkspacePanel |
| **Workspace Tiles**      | Large, iconic buttons for high-frequency entry points (e.g., "New Invoice").    | ❌ WorkspacePanel |
| **Workspace Categories** | Vertical columns of links grouped by functional category (e.g., "Maintenance"). | ❌ WorkspacePanel |

> [!IMPORTANT]
> **No Dashboards in Workspaces.** In the Modern UI, Workspaces are for navigation. Business metrics (KPIs, Charts) belong in **Dashboards** (State B content kind), not in the Workspace View.

---

## 3. Form Kinds (What Appears in the Working Area)

Each form kind has a distinct layout contract, toolbar behavior, and data flow. This is the grammar of the system — it is **NOT** optional.

| #   | Kind             | Acumatica Term    | Layout Contract                                            | Abren `ScreenKind` | Area Code |
| --- | ---------------- | ----------------- | ---------------------------------------------------------- | ------------------ | --------- |
| 1   | **Setup**        | Preferences       | Single form, no header-detail, minimal toolbar             | `setup`            | `10`      |
| 2   | **Maintenance**  | Master Data       | Single-record form with tabs, no line grid                 | `maintenance`      | `20`      |
| 3   | **Data Entry**   | Transaction Entry | Header + Detail Grid with summary, tabs, line items        | `dataEntry`        | `30`      |
| 4   | **Primary List** | Primary List / GI | Full-width grid paired with a data entry form              | `primaryList`      | `PL`      |
| 5   | **Inquiry**      | Generic Inquiry   | Full-width grid for analytical read-only data              | `inquiry`          | `40`      |
| 6   | **Processing**   | Batch Processing  | Grid with `Selected` checkbox, Process/Process All buttons | `processing`       | `50`      |
| 7   | **Report**       | Report            | Parameter form + ready-to-print rendered output            | `report`           | `60`      |

In addition to forms, the Working Area can display:

| Content Type  | Definition                                                       | Abren `ScreenKind` |
| ------------- | ---------------------------------------------------------------- | ------------------ |
| **Dashboard** | Collection of widgets providing at-a-glance business information | `dashboard`        |

### Key Behavioral Differences Between Form Kinds

| Behavior               | Setup             | Maintenance                | Data Entry                                     | Primary List               | Inquiry                  | Processing                |
| ---------------------- | ----------------- | -------------------------- | ---------------------------------------------- | -------------------------- | ------------------------ | ------------------------- |
| **Chrome (Title Bar)** | FormTitleBar      | FormTitleBar               | FormTitleBar                                   | **ListTitleBar**           | **ListTitleBar**         | **ListTitleBar**          |
| **Chrome (Toolbar)**   | FormToolbar       | FormToolbar                | FormToolbar                                    | _None_ (grid toolbar)      | _None_ (grid toolbar)    | _None_ (grid toolbar)     |
| Summary/Selection Area | Settings sections | Summary Area (collapsible) | Summary Area (collapsible)                     | Selection Area (filters)   | Selection Area (filters) | Selection Area (filters)  |
| Tabs                   | Rarely            | Yes                        | Yes (multiple)                                 | No                         | No                       | No                        |
| Detail Grid            | No                | No                         | **Yes** (line items)                           | **Yes** (results grid)     | **Yes** (results grid)   | **Yes** (selectable grid) |
| Record Navigation (◁▷) | No                | Yes                        | Yes                                            | No                         | No                       | No                        |
| Record Services        | No                | Yes (Notes/Files)          | Yes (Notes/Files)                              | No                         | No                       | No                        |
| Toolbar commands       | Save, Cancel      | Save, Cancel, Delete, Nav  | Save, Cancel, Delete, Nav, Expected Next, More | New, Refresh, Filter, Bulk | Refresh                  | Process, Process All      |

> [!IMPORTANT]
> **Chrome selection is non-negotiable.** List and inquiry screens (`PL` suffix, `inquiry`, `processing`) use `ListTitleBar` — a minimal title-only bar. Form screens (`setup`, `maintenance`, `dataEntry`) use `FormTitleBar` — a full record-context bar with back navigation, record title, and service buttons. See [Screen Runtime §4](SCREEN_RUNTIME.md#4-working-area-chrome-title-bar--toolbar) for rendering rules.

---

## 4. The Screen ID System

Screen IDs are **8-character codes** with strict semantic meaning:

```
  AP 30 10 00
  ── ── ── ──
  │   │  │  └── Variant/Version (00 = primary)
  │   │  └───── Sequence within area
  │   └──────── Functional Area Code (maps to Form Kind)
  └──────────── Module Prefix
```

### Module Prefixes

| Prefix | Module             | Abren Module Path         |
| ------ | ------------------ | ------------------------- |
| `AP`   | Accounts Payable   | `modules/finance/ap/`     |
| `GL`   | General Ledger     | `modules/finance/ledger/` |
| `CA`   | Banking            | `modules/finance/bank/`   |
| `TX`   | Tax                | `modules/finance/tax/`    |
| `IN`   | Inventory          | `modules/inventory/`      |
| `CR`   | Core (Users/Roles) | `modules/core/`           |

### Planned Screen Registry

#### Accounts Payable (AP)

| Screen ID  | Form Kind    | Title                 | Acumatica Equivalent | Status    |
| ---------- | ------------ | --------------------- | -------------------- | --------- |
| `AP301000` | Data Entry   | Payment Request Entry | AP301000             | ✅ Built  |
| `AP3010PL` | Primary List | Payment Requests List | AP3010PL             | ✅ Built  |
| `AP302000` | Data Entry   | Vendor Bill Entry     | AP301000 (Bills)     | ❌ Legacy |

#### General Ledger (GL)

> [!WARNING]
> **Screen ID Alignment Issue**: Our current `GL101000` (Ledger Settings) maps to Acumatica's `GL102000` (General Ledger Preferences), and our current `GL102000` (Fiscal Periods) conflates functionality that Acumatica splits across `GL101000` (Financial Year) + `GL201000` (Master Financial Calendar) + `GL503000` (Manage Financial Periods). A Screen ID realignment is documented in [FISCAL_CALENDAR_DESIGN.md](FISCAL_CALENDAR_DESIGN.md) and will be addressed as a dedicated domain redesign initiative.

| Screen ID  | Form Kind    | Title                      | Acumatica Equivalent | Status                          |
| ---------- | ------------ | -------------------------- | -------------------- | ------------------------------- |
| `GL101000` | Setup        | Ledger Settings            | GL102000 (GL Prefs)  | ⚠️ Needs normalization          |
| `GL102000` | Setup        | Fiscal Periods             | GL101000 + GL201000  | ⚠️ **Domain redesign required** |
| `GL201000` | Maintenance  | Chart of Accounts (Detail) | GL201500 (CoA)       | ⚠️ Needs normalization          |
| `GL2010PL` | Primary List | Chart of Accounts (List)   | GL2010PL             | ⚠️ Needs normalization          |
| `GL301000` | Data Entry   | Journal Entry              | GL301000             | ⚠️ Needs normalization          |
| `GL3010PL` | Primary List | Journal Entries List       | GL3010PL             | ⚠️ Needs normalization          |
| `GL503000` | Processing   | Manage Financial Periods   | GL503000             | 📋 Future                       |

#### Banking (CA)

| Screen ID  | Form Kind   | Title         | Acumatica Equivalent | Status    |
| ---------- | ----------- | ------------- | -------------------- | --------- |
| `CA202000` | Maintenance | Bank Accounts | CA202000             | ❌ Legacy |

#### Tax (TX)

| Screen ID  | Form Kind | Title           | Acumatica Equivalent | Status    |
| ---------- | --------- | --------------- | -------------------- | --------- |
| `TX101000` | Setup     | Tax Preferences | TX101000             | ❌ Legacy |

#### Inventory (IN)

| Screen ID  | Form Kind   | Title                 | Acumatica Equivalent | Status    |
| ---------- | ----------- | --------------------- | -------------------- | --------- |
| `IN202000` | Maintenance | Stock Items           | IN202500             | ❌ Legacy |
| `IN301000` | Data Entry  | Inventory Adjustments | IN301000             | ❌ Legacy |

### The `PL` Suffix

`PL` (Primary List) denotes the inquiry/list form **paired** with a data entry form:

- `AP301000` → Payment Request Detail (data entry)
- `AP3010PL` → Payment Requests List (inquiry grid)

The PL form is the **Workspace's link target** — clicking a Workspace menu item opens the PL form, from which the user navigates to the data entry form.

---

## 5. Form Anatomy (6 Basic Parts)

Acumatica defines 6 macro-layout templates for forms: **Form**, **Grid**, **Tab**, **FormTab**, **FormGrid**, and **TabGrid**.
Abren's `ScreenRenderer` dynamically composes these architectures based on the `ScreenKind` and declared `views`.

Every form in the Working Area has 6 basic parts. This structure is mandatory.

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. FORM TITLE BAR                                               │
│    Form Title                                                    │
│    Record ID - Record Title       [📝Note] [📧Activities] [📎Files] [⚙Settings] │
├─────────────────────────────────────────────────────────────────┤
│ 2. FORM TOOLBAR                                                  │
│    [←][→][📋][↩][+][🗑][📋▾] |K|◁|▷|▷| [Expected Next ▶] [Cmd] [···More] │
├─────────────────────────────────────────────────────────────────┤
│ 3. SUMMARY AREA (collapsible)                              [▲]  │
│    ┌──────────────┐ ┌───────────────┐ ┌──────────────────┐      │
│    │ Section A     │ │ Section B      │ │ Section C (totals)│   │
│    └──────────────┘ └───────────────┘ └──────────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│ 4. TABS                                                          │
│    [DETAILS] [TAXES] [FINANCIAL] [SHIPPING] [...]                │
├─────────────────────────────────────────────────────────────────┤
│ 5. DETAILS AREA (content of active tab)                          │
│    ┌────────────────────────────────────────────────────────┐    │
│    │ 6. ROW (line / detail)                                 │    │
│    └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Part 1: Form Title Bar

Displays the **form title** and **record title** (for data entry forms). Contains **record-level service** buttons:

| Button        | Purpose                                     | Abren Component                 |
| ------------- | ------------------------------------------- | ------------------------------- |
| 📝 Notes      | Attach a note to the selected record        | `RecordNotes` (not built)       |
| 📧 Activities | Create tasks, events, emails for the record | `RecordActivities` (not built)  |
| 📎 Files      | Attach files to the record                  | `RecordAttachments` (not built) |
| ⚙ Settings    | Screen Configuration, Personalization       | (not built)                     |

> **Title Bar buttons ≠ Toolbar buttons.** The Toolbar has document-level commands (Save, Release). The Title Bar has record-level services (Notes, Files, Activities).

### Part 2: Form Toolbar & More Menu

The toolbar is **not hand-coded per form** — commands are declared in the controller, and the platform renders them.

**Three button zones:**

1. **Standard buttons** — Save, Cancel, Add, Delete, Copy, Undo, Navigation (|◁ ◁ ▷ ▷|)
2. **Highlighted button** — Expected Next Action, prominent colored button based on current record status
3. **More menu** — All commands organized into categories

**More Menu elements:**

| Element             | Visual                        | Behavior                                           |
| ------------------- | ----------------------------- | -------------------------------------------------- |
| Category title      | Bold section header           | Groups commands (e.g., "Processing", "Activities") |
| Green dot (●)       | Next to expected next command | Same as highlighted toolbar button                 |
| Star icon (★)       | Toggleable per user           | Favorites get promoted to the toolbar              |
| Available command   | Normal text                   | Clickable; may appear on toolbar if common         |
| Unavailable command | Greyed out                    | Not applicable to record's current status          |

**Responsive behavior:**

- Wide screen → highlighted + favorite commands on toolbar
- Screen shrinks → commands cascade off toolbar one by one
- Multiple categories → multi-column More Menu; small screens → single column

### Part 3: Summary Area (or Selection Area)

| Form Kind                | Zone              | Content                   | Behavior        |
| ------------------------ | ----------------- | ------------------------- | --------------- |
| Data Entry / Maintenance | Summary Area      | ID, status, dates, totals | Collapsible (▲) |
| Inquiry / Processing     | Selection Area    | Filter criteria           | Not collapsible |
| Setup                    | Settings sections | General settings          | Not collapsible |

Fields are grouped into **color-coded sections** (fieldsets). Users can personalize visible fields; admins control system-wide defaults.

### Part 4: Tabs

Organize information into logical sections. Most data entry forms have multiple tabs. Users can personalize which tabs are visible.

### Part 5: Details Area

Can contain three content types:

| Type             | Example           | Abren                      |
| ---------------- | ----------------- | -------------------------- |
| Table with rows  | SO line items     | `AppGrid` / TanStack Table |
| UI elements      | Customer settings | `AppFieldset` groups       |
| Rich text editor | Case description  | (not built)                |

### Part 6: Row (Line / Detail)

Each row is a detail of the selected record. Users can personalize columns. One form can have multiple tables across different tabs.

---

## 6. The Command Model (Two-Layer Hybrid)

Acumatica uses a two-layer model for commands. Abren adopts the same pattern.

### Layer 1: Declaration (Data Object)

In Acumatica, actions are declared as data members on the Graph with attribute-based configuration:

```csharp
// Acumatica: PXAction declaration
public PXAction<APInvoice> Release;
[PXButton(CommitChanges = true, DisplayOnMainToolbar = true)]
[PXUIField(DisplayName = "Release")]
protected virtual void release() { /* logic */ }
```

In Abren, commands are **declarative data objects** in `commands.ts`:

```typescript
// Abren: ScreenCommand declaration
export const releaseCommand: ScreenCommand = {
  key: 'release',
  labelKey: 'ap.AP301000.actions.release',
  icon: 'check-circle',
  categoryKey: 'processing',
  displayOnMainToolbar: true,
  expectedNext: (state) => state.domainStatus === 'OPEN',
  isVisible: (state) => ['OPEN', 'SUBMITTED'].includes(state.domainStatus),
  isEnabled: (state, data) => data.total > 0,
  execute: (controller) => controller.executeAction('release'),
}
```

### Layer 2: Workflow Configuration (Placement/Visibility)

In Acumatica, the Workflow API controls category, toolbar placement, and enable/disable conditions:

```csharp
// Acumatica: Workflow configuration (overrides static attributes)
actions.Add(g => g.Release, a => a
    .WithCategory(PredefinedCategory.Processing)
    .IsDuplicatedInToolbar()
    .IsDisabledWhen(conditions.IsNotOpen)
);
```

In Abren, the **platform resolver** (`ScreenToolbar` component) reads command properties and automatically renders the toolbar, More Menu, favorites, and Expected Next Action highlighting. No hand-coding per form.

---

## 7. Data Views

| Acumatica                       | Abren                                     | Purpose                                          |
| ------------------------------- | ----------------------------------------- | ------------------------------------------------ |
| `PXSelect<APInvoice> Document`  | `views.paymentRequest` (`kind: 'single'`) | Primary View — drives navigation and persistence |
| `PXSelect<APTran> Transactions` | `views.lines` (`kind: 'collection'`)      | Detail View — line items grid                    |
| `PXSelect<Vendor> Vendors`      | Selector/lookup composable                | Lookup View — for dropdowns                      |

The `views` concept in `ScreenDefinition` maps directly to Acumatica's Data Views.

---

## 8. The Workflow Engine (State Machine)

Acumatica's Workflow Engine is a declarative finite state machine:

```
                    ┌──────┐
         ┌─────────│ HOLD │──────────┐
         │         └──┬───┘          │
         │   Remove   │              │ Cancel
         │   Hold     ▼              │
         │         ┌──────┐          ▼
         │         │ OPEN │      ┌────────┐
         │         └──┬───┘      │VOIDED  │
         │   Release  │          └────────┘
         │            ▼
         │         ┌──────────┐
         │         │ RELEASED │
         │         └──────────┘
         │
   Put on Hold (reverse)
```

### Abren Dual-Layer State Machine

```
UI State:     INITIALIZING → VIEW → EDIT → SAVING → VIEW
Domain State: DRAFT → SUBMITTED → APPROVED → AUTHORIZED (backend-owned)
```

- **UI state** tracks presentation concerns (loading, editing, saving)
- **Domain state** (from the backend) drives command visibility and Expected Next Action
- The controller mediates between both layers

---

## 9. Side Panel

The side panel is an **icon strip** on the right edge — each icon hosts an embedded view:

| Icon               | Content                                             | Contextual?                            |
| ------------------ | --------------------------------------------------- | -------------------------------------- |
| 📋 Record Services | Notes, Files, Activities for current record         | Yes — bound to current record key      |
| 📊 Related Form    | Full embedded form (e.g., Customer Details from SO) | Yes — receives record key as parameter |
| 💬 Activities      | Communication history                               | Yes                                    |

**Key behaviors:**

- Contextual: automatically refreshes when grid row selection changes
- Collapsible: icon strip can expand/collapse
- List forms vs data entry forms may show different icon sets

**Abren:** `SidePanelContract` with `SidePanelLocalTab` and `SidePanelScreenTab`. Needs: `RecordServicesMenu`, context-binding to grid selection, collapse/expand chrome.

---

## 10. Workspace & Main Menu

**Main Menu** = persistent left rail with module entries. **Workspace View** = State A of the center area (see §2).

```
MAIN MENU (expanded / collapsed / minimized)
├── 🏠 Home
├── 📊 Finance (module entry)
│   Click → Center Area transitions to WORKSPACE VIEW:
│   ├── Links to Forms: Bills, Vendors, JEs, CoA
│   ├── Links to Reports: AP Aging, Trial Balance
│   ├── Links to Dashboards: Finance Overview
│   └── Favorites (user-pinned)
│   Click a link → Center Area transitions to WORKING AREA (form loads)
├── 📦 Distribution (module entry)
│   ├── Inventory, Sales Orders, POs
├── ⚙️ Organization (module entry)
│   └── Users, Roles, Branches
└── 🔍 Global Search
```

**Key behaviors:**

- Main Menu: **expanded** (full names), **collapsed** (compact), **minimized** (Menu button in Top Pane)
- Clicking a module transitions the center area to **Workspace View** (State A — replaces whatever was there)
- Users can pin forms/reports/dashboards to **Favorites** within a Workspace
- Clicking a link/tile transitions the center area to **Working Area** (State B — form loads, Side Panel becomes available)

**Abren:** `ModuleDefinition.menuItems` + `workspaceEntries`. Main Menu = `AuthenticatedLayout` sidebar. Workspace View = `WorkspacePanel` component.

---

## 11. Layout Template System

Acumatica's `qp-template` defines named column proportions for Summary Area layouts:

| Template | Ratio      | Usage                                 |
| -------- | ---------- | ------------------------------------- |
| `1`      | Full width | Single-column setup forms             |
| `1-1`    | 50/50      | Two-column maintenance                |
| `1-1-1`  | 33/33/33   | Three equal columns                   |
| `7-17`   | ~30/70     | Narrow left + wide right              |
| `17-7`   | ~70/30     | Wide left + narrow right              |
| `7-10-7` | ~29/42/29  | ID left, details center, totals right |

Templates can **nest** — a `1-1` inside one slot of a `1-1-1`.

**Abren:** `ScreenDefinition.layout.summaryTemplate` is typed. The `AppTemplate` Vue component that renders the template name as CSS Grid is not yet built.

---

## 12. i18n Key Convention

Format: `{module}.{screenId}.{section}.{key}`

```
ap.AP301000.summary.vendor       → "Vendor"
ap.AP301000.summary.status       → "Status"
ap.AP301000.actions.release      → "Release"
ap.AP301000.tabs.details         → "Document Details"
gl.GL301000.summary.batchNumber  → "Batch Number"
```

Use the key as fallback display string until full i18n infrastructure is implemented.

---

## 13. Resolved Architectural Decisions

| Decision                        | Resolution                                                                                    | Rationale                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Maintenance vs Data Entry       | **Keep separate**                                                                             | Acumatica's way — proven at scale. Layout contracts differ.                      |
| ActionContract vs ScreenCommand | **Two-layer hybrid** — declarative data objects + platform resolver                           | Matches Acumatica's PXAction + Workflow API pattern                              |
| Processing screens              | **Deferred**                                                                                  | Document pattern spec only; implement when needed                                |
| Workspace as screen kind        | **No** — Workspace View is State A of the center area, not a screen kind or a separate region | Workspace and Working Area are mutually exclusive states of the same center area |
