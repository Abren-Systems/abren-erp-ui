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
| Toolbar commands       | Save, Cancel      | Save, Cancel, Delete, Nav  | Save, Cancel, Delete, Nav, Expected Next, More | New, Refresh, Filter, Bulk | Refresh                  | **Process, Process All**  |

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

| Prefix | Module            | Abren Module Path         |
| ------ | ----------------- | ------------------------- |
| `AP`   | Accounts Payable  | `modules/finance/ap/`     |
| `GL`   | General Ledger    | `modules/finance/ledger/` |
| `CA`   | Banking           | `modules/finance/bank/`   |
| `TX`   | Tax               | `modules/finance/tax/`    |
| `IN`   | Inventory         | `modules/inventory/`      |
| `SM`   | System Management | `modules/core/`           |
| `EP`   | Enterprise Portal | `modules/workflows/`      |

### Planned Screen Registry

#### Accounts Payable (AP)

| Screen ID  | Form Kind    | Title                 | Acumatica Equivalent | Status     |
| ---------- | ------------ | --------------------- | -------------------- | ---------- |
| `AP301000` | Data Entry   | Bills and Adjustments | AP301000             | ✅ Aligned |
| `AP3010PL` | Primary List | Bills and Adjustments | AP3010PL             | ✅ Aligned |
| `AP301500` | Data Entry   | Payment Requests      | (Abren Extension)    | ✅ Aligned |
| `AP3015PL` | Primary List | Payment Requests List | (Abren Extension)    | ✅ Aligned |
| `AP302000` | Data Entry   | Checks and Payments   | AP302000             | 📋 Future  |

#### General Ledger (GL)

| Screen ID  | Form Kind    | Title                      | Acumatica Equivalent | Status     |
| ---------- | ------------ | -------------------------- | -------------------- | ---------- |
| `GL101000` | Setup        | Financial Year             | GL101000             | ✅ Aligned |
| `GL102000` | Setup        | GL Preferences             | GL102000             | ✅ Aligned |
| `GL201000` | Maintenance  | Master Financial Calendar  | GL201000             | ✅ Aligned |
| `GL202500` | Maintenance  | Chart of Accounts (Detail) | GL202500             | ✅ Aligned |
| `GL2025PL` | Primary List | Chart of Accounts (List)   | GL2025PL             | ✅ Aligned |
| `GL301000` | Data Entry   | Journal Transactions       | GL301000             | ✅ Aligned |
| `GL3010PL` | Primary List | Journal Transactions List  | GL3010PL             | ✅ Aligned |
| `GL501000` | Processing   | Release Transactions       | GL501000             | 📋 Future  |
| `GL503000` | Processing   | Manage Financial Periods   | GL503000             | ✅ Aligned |

#### System Management (SM)

| Screen ID  | Form Kind   | Title      | Acumatica Equivalent | Status     |
| ---------- | ----------- | ---------- | -------------------- | ---------- |
| `SM201010` | Maintenance | Users      | SM201010             | ✅ Aligned |
| `SM201100` | Maintenance | User Roles | SM201100             | ✅ Aligned |
| `CS102000` | Maintenance | Companies  | CS102000             | ✅ Aligned |

#### Accounts Receivable (AR)

| Screen ID  | Form Kind  | Title                     | Acumatica Equivalent | Status     |
| ---------- | ---------- | ------------------------- | -------------------- | ---------- |
| `AR301000` | Data Entry | Invoices and Memos        | AR301000             | ✅ Aligned |
| `AR303000` | Data Entry | Payments and Applications | AR303000             | 📋 Future  |

#### Enterprise Portal (EP)

| Screen ID  | Form Kind  | Title     | Acumatica Equivalent | Status     |
| ---------- | ---------- | --------- | -------------------- | ---------- |
| `EP503010` | Processing | Approvals | EP503010             | ✅ Aligned |

#### Banking (CA)

| Screen ID  | Form Kind    | Title                | Acumatica Equivalent | Status     |
| ---------- | ------------ | -------------------- | -------------------- | ---------- |
| `CA202000` | Maintenance  | Bank Accounts        | CA202000             | ✅ Aligned |
| `CA2020PL` | Primary List | Bank Accounts (List) | CA2020PL             | ✅ Aligned |

#### Tax (TX)

| Screen ID  | Form Kind    | Title             | Acumatica Equivalent | Status     |
| ---------- | ------------ | ----------------- | -------------------- | ---------- |
| `TX101000` | Setup        | Tax Categories    | TX101000             | 📋 Future  |
| `TX205000` | Maintenance  | Taxes             | TX205000             | ✅ Aligned |
| `TX2050PL` | Primary List | Taxes (List)      | TX2050PL             | ✅ Aligned |
| `TX205500` | Maintenance  | Tax Groups        | TX205500             | ✅ Aligned |
| `TX2055PL` | Primary List | Tax Groups (List) | TX2055PL             | ✅ Aligned |

#### Inventory (IN)

| Screen ID  | Form Kind    | Title                 | Acumatica Equivalent | Status     |
| ---------- | ------------ | --------------------- | -------------------- | ---------- |
| `IN101000` | Setup        | Inventory Preferences | IN101000             | 📋 Future  |
| `IN202000` | Maintenance  | Item Classes          | IN202000             | 📋 Future  |
| `IN202500` | Maintenance  | Stock Items           | IN202500             | ✅ Aligned |
| `IN2025PL` | Primary List | Stock Items           | IN2025PL             | ✅ Aligned |
| `IN204000` | Maintenance  | Warehouses            | IN204000             | ✅ Aligned |
| `IN2040PL` | Primary List | Warehouses            | IN2040PL             | ✅ Aligned |
| `IN303000` | Data Entry   | Adjustments           | IN303000             | ✅ Aligned |
| `IN3030PL` | Primary List | Adjustments           | IN3030PL             | ✅ Aligned |

### The `PL` Suffix

`PL` (Primary List) denotes the inquiry/list form **paired** with a data entry form:

- `AP301500` → Payment Request Detail (data entry)
- `AP3015PL` → Payment Requests List (inquiry grid)

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

## Use the key as fallback display string until full i18n infrastructure is implemented.

## 13. The DAC Architecture (Data Access Class) — Deep Dive

In Acumatica, a **DAC** is the typed schema for a database table. But it is much more than a data model — it is a **declarative behavior contract**. Every field on a DAC carries attributes that control persistence, UI rendering, validation, defaulting, and cross-field relationships.

### 13.1 Bound vs. Unbound Fields

| Type                  | Acumatica                       | Abren                      | Persisted? | Example                         |
| --------------------- | ------------------------------- | -------------------------- | ---------- | ------------------------------- |
| **Bound**             | `[PXDBString]`, `[PXDBDecimal]` | Domain entity property     | ✅ Yes     | `vendor_name`, `amount`         |
| **Unbound (Virtual)** | `[PXString]`, `[PXDecimal]`     | `computed()` in controller | ❌ No      | `displayTotal`, `formattedDate` |

**Key Rule:** Unbound fields are calculated on the server (in Acumatica) or in the controller (in Abren). They must NEVER appear in mutation payloads. In Abren, declare them as `computed()` properties on the controller return object, not as form fields.

### 13.2 DAC Attribute → Abren Mapping (Complete)

| Acumatica Attribute          | Abren Equivalent                            | Layer            | Purpose                            |
| ---------------------------- | ------------------------------------------- | ---------------- | ---------------------------------- |
| `[PXDBString(60)]`           | Zod `z.string().max(60)`                    | Validation       | String field with max length       |
| `[PXDBDecimal(2)]`           | `SemanticKind.Amount`                       | Semantic Runtime | Decimal with precision             |
| `[PXDBBool]`                 | `type: 'checkbox'` in `FieldDefinition`     | Field System     | Boolean toggle                     |
| `[PXDBDate]`                 | `type: 'date'` in `FieldDefinition`         | Field System     | Date picker                        |
| `[PXDBIdentity]`             | `UUIDv7` via `generate_uuid7()`             | Shared Kernel    | Auto-generated identity            |
| `[PXUIField(DisplayName)]`   | `label` in `FieldDefinition`                | Field System     | UI label                           |
| `[PXUIField(Enabled=false)]` | `readonly: () => true` in `FieldDefinition` | Field System     | Always read-only                   |
| `[PXDefault]`                | `defaultValues` in TanStack Form            | Controller       | Static default                     |
| `[PXDefault(typeof(...))]`   | `watch` + `form.setFieldValue()`            | Controller       | Derived default from another field |
| `[PXSelector(typeof(...))]`  | `type: 'selector'` + lookup composable      | Field System     | Cross-entity lookup                |
| `[PXDBQuantity]`             | `SemanticKind.Quantity`                     | Semantic Runtime | Unit-aware quantity                |
| `[PXDBCurrency]`             | `SemanticKind.Amount`                       | Semantic Runtime | Currency-aware amount              |
| `[PXFormula]`                | `computed()` in controller                  | Controller       | Server-calculated derived value    |
| `[PXParent]`                 | View dependency in `ScreenDefinition.views` | Screen Runtime   | Master-detail FK link              |

### 13.3 Key Structure

| Acumatica Key          | Abren Equivalent                                 | Purpose                    |
| ---------------------- | ------------------------------------------------ | -------------------------- |
| `[PXDBIdentity]`       | `UUIDv7` branded type (e.g., `PaymentRequestId`) | Surrogate primary key      |
| `[IsKey]`              | Composite key fields on domain entity            | Natural key for uniqueness |
| `[PXParent]`           | `parentId` property + view `queryKey` dependency | FK to master record        |
| `[PXForeignReference]` | Soft reference validated by facade               | Cross-module reference     |

### 13.4 The Selector Contract (Deep)

In Acumatica, `PXSelector` doesn't just render a dropdown — it opens a **lookup panel** that is itself a mini-screen backed by a BQL query. The selector defines:

```csharp
// Acumatica: PXSelector with substitution
[PXSelector(typeof(Search<Vendor.bAccountID>),
  SubstituteKey = typeof(Vendor.acctCD),
  DescriptionField = typeof(Vendor.acctName))]
public int? VendorID { get; set; }
```

**Abren equivalent** — the `FieldDefinition` must declare a selector contract:

```typescript
// fields.ts — Selector field with lookup binding
{
  key: 'vendorId',
  label: 'Vendor',
  type: 'selector',
  selector: {
    // The list screen that provides lookup data
    screenId: 'AP2020PL',
    // Which field to display to the user (SubstituteKey)
    displayField: 'acctCD',
    // Description shown alongside the key
    descriptionField: 'acctName',
    // How to map selection result back to form fields
    resultMap: {
      'bAccountID': 'vendorId',
      'defaultTermsId': 'termsId',  // Auto-populate related fields
    },
  },
} as FieldDefinition<APBill, string>
```

> [!IMPORTANT]
> **Selectors are portals, not dropdowns.** A selector's `resultMap` can populate multiple fields at once (e.g., selecting a Vendor auto-fills `Terms`, `PaymentMethod`, `DefaultCashAccount`). This is the Acumatica "field cascade" pattern and is critical for data entry efficiency.

### 13.5 Default Value Strategies

| Strategy         | Acumatica                                   | Abren                                         | When                       |
| ---------------- | ------------------------------------------- | --------------------------------------------- | -------------------------- |
| **Constant**     | `[PXDefault("USD")]`                        | `defaultValues: { currency: 'ETB' }` in form  | Static value on new record |
| **From Parent**  | `[PXDefault(typeof(APSetup.defaultTerms))]` | `watch(vendor, ...)` + `form.setFieldValue()` | When parent field changes  |
| **Sequence**     | `[PXDefault(typeof(Numbering.newSymbol))]`  | Backend auto-number via API response          | Server-generated on create |
| **Current User** | `[PXDefault(typeof(AccessInfo.userID))]`    | `SYSTEM_ACTOR_ID` or auth context             | Auto-fill current user     |
| **Formula**      | `[PXFormula(typeof(...))]`                  | `computed()` derived from other fields        | Calculated field           |

---

## 14. Platform Services (Notes, Files, Audit)

The `FormTitleBar` hosts **Standard Service Icons** that provide cross-cutting functionality without screen-specific logic.

### 14.1 Notes & Attachments

Any screen of kind `maintenance` or `dataEntry` automatically supports the **Notes/Files toggle**.

- **Notes**: Simple text blob associated with the record.
- **Files**: List of UUID references to the file storage system.

### 14.2 Audit & Change Log

Every record in a `maintenance` or `dataEntry` screen must implement the **Audit Contract**:

- `CreatedBy`, `CreatedDateTime`
- `LastModifiedBy`, `LastModifiedDateTime`

Visible via the "Tools > Audit History" menu item (Standard in FormTitleBar).

---

## 15. The Processing Pattern (50-Series)

Processing screens are **Batch Engines**. They follow a rigid interaction model:

1. **Selection Area**: Filters to narrow down the records to process.
2. **Selectable Grid**: A grid where the first column is a checkbox (`PXCheckBox`).
3. **Action Bar**:
   - `Process`: Executes the command for checked rows.
   - `Process All`: Executes for all rows matching filters (ignoring checkboxes).
4. **Long Operation Manager**: A progress modal or background job tracker that prevents concurrent execution of the same processing type.

**Abren:** Use `kind: 'processing'` in `ScreenDefinition`. The `ScreenRenderer` will automatically inject the `Process/Process All` buttons and wire them to the controller's `process` command.

---

## 16. The Graph Lifecycle — Event Model (Deep Dive)

In Acumatica, `PXGraph` is not just a controller — it is a **reactive event bus**. Every field change, row selection, and persistence attempt fires typed events that the developer hooks into. This is the behavioral core of the framework.

### 16.1 The Event Categories

| Event               | Acumatica Handler               | Fires When                                    | Abren Equivalent                                 |
| ------------------- | ------------------------------- | --------------------------------------------- | ------------------------------------------------ |
| **FieldDefaulting** | `{DAC}_{Field}_FieldDefaulting` | A field's default value is being calculated   | `defaultValues` in TanStack Form config          |
| **FieldUpdating**   | `{DAC}_{Field}_FieldUpdating`   | A field value is about to change (can cancel) | `validate` in `FieldDefinition`                  |
| **FieldUpdated**    | `{DAC}_{Field}_FieldUpdated`    | A field value has changed                     | `watch()` on form field + `form.setFieldValue()` |
| **FieldVerifying**  | `{DAC}_{Field}_FieldVerifying`  | A field is being validated before acceptance  | Zod schema validator on the form                 |
| **RowSelecting**    | `{DAC}_RowSelecting`            | A database row is being loaded                | TanStack Query `select` transform                |
| **RowSelected**     | `{DAC}_RowSelected`             | A record is now the current record            | `watch(entity, ...)` in controller               |
| **RowInserting**    | `{DAC}_RowInserting`            | A new record is being created                 | `onSubmit` in form config                        |
| **RowUpdating**     | `{DAC}_RowUpdating`             | An existing record is being modified          | `onSubmit` in form config                        |
| **RowPersisting**   | `{DAC}_RowPersisting`           | A record is about to be saved to DB           | Pre-submit validation in `handleSave()`          |
| **RowPersisted**    | `{DAC}_RowPersisted`            | A record was saved successfully               | TanStack Query `onSuccess` callback              |

### 16.2 The "FieldUpdated Cascade" Pattern

This is the most critical pattern in Acumatica. When a user changes one field, related fields must automatically update:

```csharp
// Acumatica: When Vendor changes, auto-populate Terms and Currency
protected void APInvoice_VendorID_FieldUpdated(PXCache cache, PXFieldUpdatedEventArgs e)
{
    APInvoice doc = (APInvoice)e.Row;
    Vendor vendor = PXSelect<Vendor,
        Where<Vendor.bAccountID, Equal<Required<APInvoice.vendorID>>>>
        .Select(this, doc.VendorID);
    doc.TermsID = vendor.TermsID;
    doc.CuryID = vendor.CuryID;
    doc.PaymentMethodID = vendor.PaymentMethodID;
}
```

**Abren equivalent** — use `watch` on the form field inside the controller:

```typescript
// controller.ts — Field cascade: Vendor → Terms + Currency
watch(
  () => form.getFieldValue('vendorId'),
  async (newVendorId) => {
    if (!newVendorId) return
    const vendor = await fetchVendor(newVendorId)
    form.setFieldValue('termsId', vendor.defaultTermsId)
    form.setFieldValue('currency', vendor.currencyId)
    form.setFieldValue('paymentMethodId', vendor.paymentMethodId)
  },
)
```

> [!IMPORTANT]
> **All field cascades MUST live in the controller.** The Vue template must never contain logic that updates one field based on another. This preserves the Acumatica principle that the Graph (controller) is the single source of behavior.

### 16.3 The "RowSelected" Pattern — State-Driven UI

In Acumatica, `RowSelected` is where you enable/disable fields and buttons based on the current record's state:

```csharp
// Acumatica: Disable editing when document is Released
protected void APInvoice_RowSelected(PXCache cache, PXRowSelectedEventArgs e)
{
    APInvoice doc = (APInvoice)e.Row;
    bool isEditable = doc.Status == APDocStatus.Hold || doc.Status == APDocStatus.Balanced;
    PXUIFieldAttribute.SetEnabled<APInvoice.vendorID>(cache, doc, isEditable);
    PXUIFieldAttribute.SetEnabled<APInvoice.curyOrigDocAmt>(cache, doc, isEditable);
    Release.SetEnabled(doc.Status == APDocStatus.Balanced);
}
```

**Abren equivalent** — this is the `ScreenStatePolicy`:

```typescript
// policy.ts — Declarative replacement for RowSelected event handlers
export const AP301500_POLICY: ScreenStatePolicy<PaymentRequestStatus, PRFieldKey> = {
  states: {
    DRAFT: {
      editable: true,
      fields: {
        requesterId: { readonly: true }, // Auto-filled, never editable
        status: { readonly: true }, // System-managed
        beneficiaryId: { required: true },
      },
    },
    SUBMITTED: { editable: false }, // Everything locked
    RELEASED: { editable: false },
  },
}
```

> [!TIP]
> **Abren's `ScreenStatePolicy` replaces hundreds of lines of `RowSelected` handlers.** Instead of imperatively calling `SetEnabled()` per field, we declare the contract once. The platform's `useField` binding reads the policy via the unified `ScreenProjection` and enforces it automatically.

### 16.4 The "RowPersisting" Pattern — Pre-Save Validation

```csharp
// Acumatica: Block saving if total is zero
protected void APInvoice_RowPersisting(PXCache cache, PXRowPersistingEventArgs e)
{
    APInvoice doc = (APInvoice)e.Row;
    if (doc.CuryOrigDocAmt == 0)
        throw new PXRowPersistingException(typeof(APInvoice.curyOrigDocAmt),
            doc.CuryOrigDocAmt, "Document total cannot be zero.");
}
```

**Abren equivalent** — Zod schema validation in the form:

```typescript
// controller.ts — Form-level validation (replaces RowPersisting)
const billSchema = z.object({
  vendorId: z.string().min(1, 'Vendor is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  currency: z.string().min(1, 'Currency is required'),
})

const form = useForm({
  validators: { onChange: billSchema },
  onSubmit: async ({ value }) => {
    /* persists only if valid */
  },
})
```

---

## 17. Master-Detail-SubDetail Orchestration

Acumatica's most powerful pattern is the **header-detail** relationship, where a document (header) owns a collection of line items (details), and each line may have sub-details (e.g., tax breakdown per line).

### 17.1 The View Dependency Graph

```
┌─────────────────────────────────────────────────────┐
│ PXGraph: APInvoiceEntry                             │
│                                                     │
│  Document (Primary View)                            │
│     │ PXSelect<APInvoice>                           │
│     │                                               │
│     ├── Transactions (Detail View)                  │
│     │    PXSelect<APTran,                           │
│     │      Where<APTran.refNbr, Equal<Current       │
│     │            <APInvoice.refNbr>>>>              │
│     │    │                                          │
│     │    └── TaxLines (Sub-Detail View)             │
│     │         PXSelect<APTaxTran,                   │
│     │           Where<APTaxTran.tranLineNbr,        │
│     │             Equal<Current<APTran.lineNbr>>>>  │
│     │                                               │
│     └── Taxes (Aggregate View)                      │
│          PXSelect<APTaxTran, summarized>            │
└─────────────────────────────────────────────────────┘
```

### 17.2 Abren View Dependency Declaration

```typescript
// screen.ts — Declaring the view dependency graph
views: {
  // Primary View (the header)
  document: {
    name: 'document',
    kind: 'single',
    containerName: 'APInvoice',
    queryKey: ['ap', 'bills', 'detail'] as const,
  },
  // Detail View (line items, filtered by header ID)
  transactions: {
    name: 'transactions',
    kind: 'collection',
    containerName: 'APTran',
    queryKey: ['ap', 'bills', 'lines'] as const,
    // PROPOSED: parentView binding
    // parentView: 'document',
    // foreignKey: 'refNbr',
  },
}
```

### 17.3 The "Current" Mechanism

In Acumatica, `Current<APInvoice.refNbr>` means "the value of `refNbr` on the currently selected record in the primary view." This is how details stay in sync with the header.

**Abren equivalent** — TanStack Query key includes the parent ID:

```typescript
// application/useBillLines.ts
export function useBillLines(billId: Ref<string | null>) {
  return useQuery({
    queryKey: computed(() => ['ap', 'bills', 'lines', billId.value]),
    queryFn: () => apApi.getBillLines(billId.value!),
    enabled: computed(() => !!billId.value),
  })
}
```

The controller wires this by deriving `billId` from the primary entity:

```typescript
// controller.ts
const billId = computed(() => entity.value?.id ?? null)
const { data: lines } = useBillLines(billId)
```

> [!IMPORTANT]
> **When the header record changes (via navigation ◁▷), all detail queries must automatically re-fetch.** This is guaranteed by including the parent ID in the `queryKey`. TanStack Query's reactivity handles the rest — no manual invalidation needed.

---

## 18. BQL and the Query Contract

Acumatica's **BQL (Business Query Language)** is a strongly-typed query DSL embedded in C#. Every data view is backed by a BQL statement that defines what data is fetched, filtered, and sorted.

### 18.1 BQL → Abren Query Mapping

| BQL Concept                  | Abren Equivalent                  | Example                      |
| ---------------------------- | --------------------------------- | ---------------------------- |
| `PXSelect<DAC>`              | `useQuery({ queryKey, queryFn })` | Fetch all records            |
| `Where<Field, Equal<Const>>` | Backend CQRS filter DTO           | `{ status: 'OPEN' }`         |
| `And<Field, Greater<Zero>>`  | Compound filter                   | `{ amount: { $gt: 0 } }`     |
| `OrderBy<Asc<Field>>`        | `orderBy` param in API call       | `?sort=date:asc`             |
| `Current<Parent.field>`      | `queryKey` includes parent ref    | `['bills', 'lines', billId]` |
| `Optional<Where<...>>`       | Conditional `enabled` on query    | `enabled: computed(...)`     |

### 18.2 The Read-Side Contract

Every list screen (PL suffix) needs a **query contract** that maps to the backend's CQRS read model:

```typescript
// Abren: List query with filters and sorting
export function usePaymentRequests(filters: Ref<PRFilterDTO>) {
  return useQuery({
    queryKey: computed(() => ['ap', 'payment-requests', filters.value]),
    queryFn: () => apApi.listPaymentRequests(filters.value),
  })
}
```

The `filters` object is the Abren equivalent of BQL's `Where` clause. It is typed by the backend's read DTO and validated by Zod.

---

## 19. The Workflow Engine — Deep Architecture

Acumatica's Workflow API is a **declarative finite state machine** configured in C# fluent syntax. It controls which actions are available, which fields are editable, and what the "expected next action" is — all based on the current document status.

### 19.1 The Three Layers of Workflow

| Layer                 | Acumatica                             | Abren                         | File          |
| --------------------- | ------------------------------------- | ----------------------------- | ------------- |
| **State Declaration** | `context.AddScreenConfigurationFor()` | `ScreenStatePolicy`           | `policy.ts`   |
| **Transition Rules**  | `.WithTransitions(t => ...)`          | `ScreenCommand.from[]` / `to` | `commands.ts` |
| **Field States**      | `.WithFieldStates(fs => ...)`         | `StateBehavior.fields`        | `policy.ts`   |

### 19.2 Acumatica Workflow Configuration (Full Example)

```csharp
// Acumatica: Full workflow for AP Bill
context.AddScreenConfigurationFor(screen => screen
  .StateIdentifierIs<APInvoice.status>()
  .AddDefaultFlow(flow => flow
    .WithFlowStates(states => {
      states.Add<State.hold>(state => state
        .IsInitial()
        .WithFieldStates(fs => {
          fs.AddField<APInvoice.vendorID>(f => f.IsDisabled());
        })
        .WithActions(actions => {
          actions.Add(g => g.RemoveHold, a => a.IsDuplicatedInToolbar());
        }));
      states.Add<State.balanced>(state => state
        .WithActions(actions => {
          actions.Add(g => g.Release, a => a
            .IsDuplicatedInToolbar()
            .WithConnotation(ActionConnotation.Success));
          actions.Add(g => g.PutOnHold);
        }));
      states.Add<State.released>(state => state
        .WithFieldStates(fs => {
          fs.DisableFields();  // All fields locked
        }));
    })
    .WithTransitions(transitions => {
      transitions.Add(t => t.From<State.hold>().To<State.balanced>()
        .IsTriggeredOn(g => g.RemoveHold));
      transitions.Add(t => t.From<State.balanced>().To<State.hold>()
        .IsTriggeredOn(g => g.PutOnHold));
      transitions.Add(t => t.From<State.balanced>().To<State.released>()
        .IsTriggeredOn(g => g.Release));
    })
  )
);
```

### 19.3 Abren Equivalent — The Four Files of Authority

The same workflow is expressed across four files in Abren:

**1. `policy.ts`** — Declares field states per domain status (replaces `WithFieldStates`):

```typescript
export const AP301000_POLICY: ScreenStatePolicy<APBillStatus, APBillFieldKey> = {
  states: {
    HOLD: {
      editable: true,
      fields: { vendorId: { readonly: true } },
      actionRequiredLabel: 'Remove Hold',
    },
    BALANCED: {
      editable: true,
      deletable: true,
      actionRequiredLabel: 'Release',
    },
    RELEASED: { editable: false },
  },
}
```

**2. `commands.ts`** — Declares transitions (replaces `WithTransitions` + `WithActions`):

```typescript
export const AP301000_COMMANDS: readonly ScreenCommand[] = [
  {
    key: 'removeHold',
    kind: 'workflow',
    labelKey: 'Remove Hold',
    variant: 'primary',
    displayOnMainToolbar: true,
    from: ['HOLD'],
    to: 'BALANCED',
  },
  {
    key: 'putOnHold',
    kind: 'workflow',
    labelKey: 'Put on Hold',
    variant: 'neutral',
    from: ['BALANCED'],
    to: 'HOLD',
  },
  {
    key: 'release',
    kind: 'workflow',
    labelKey: 'Release',
    variant: 'primary',
    displayOnMainToolbar: true,
    from: ['BALANCED'],
    to: 'RELEASED',
    requiresConfirmation: true,
  },
]
```

**3. `fields.ts`** — Declares field metadata (replaces DAC attributes).

**4. `controller.ts`** — Registers command executors and field cascades (replaces Graph event handlers).

### 19.4 Expected Next Action Resolution

The "green button" in Acumatica's toolbar is the **Expected Next Action** — the single most likely action the user should take given the current document state.

```
State: HOLD      → Expected Next: "Remove Hold" (green)
State: BALANCED  → Expected Next: "Release" (green)
State: RELEASED  → No expected next (document is final)
```

**Abren resolution** — `resolveScreenProjection()` finds the first `primary` variant command whose `from[]` includes the current domain state:

```typescript
// resolve-screen-model.ts (already implemented)
const expectedNextCmd = getExpectedNextAction(commands, domainState, availableActions)
```

---

## 20. Navigation & Record Identity

### 20.1 The Record Navigator (◁ ▷)

In Acumatica, data entry and maintenance screens have **record navigation arrows** that let users browse through records without returning to the list. The navigator maintains a **record set** derived from the list screen's last filter.

| Component    | Acumatica | Abren                                  |
| ------------ | --------- | -------------------------------------- |
| First Record | `\|◁`     | `pairedListRoute` + query cache        |
| Previous     | `◁`       | Navigate to previous ID in cached list |
| Next         | `▷`       | Navigate to next ID in cached list     |
| Last Record  | `▷\|`     | Navigate to last ID in cached list     |

### 20.2 The Paired List Pattern

Every data entry screen has a **paired list screen** that feeds it records:

```
AP3010PL (list) ←→ AP301000 (detail)
GL3010PL (list) ←→ GL301000 (detail)
TX2050PL (list) ←→ TX205000 (detail)
```

**Abren:** The `ScreenDefinition.pairedListRoute` property links form screens to their list counterparts. When navigating from a list to a detail, the list's current filter state should be preserved in a query cache so the record navigator can use it.

---

## 21. Resolved Architectural Decisions

| Decision                        | Resolution                                                                                    | Rationale                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Maintenance vs Data Entry       | **Keep separate**                                                                             | Acumatica's way — proven at scale. Layout contracts differ.                      |
| ActionContract vs ScreenCommand | **Two-layer hybrid** — declarative data objects + platform resolver                           | Matches Acumatica's PXAction + Workflow API pattern                              |
| Processing screens              | **Standardized**                                                                              | Pattern defined in §15.                                                          |
| Workspace as screen kind        | **No** — Workspace View is State A of the center area, not a screen kind or a separate region | Workspace and Working Area are mutually exclusive states of the same center area |
| Field cascades location         | **Controller only** — Vue templates must never contain cross-field update logic               | Matches Acumatica's Graph event handler exclusivity (§16.2)                      |
| RowSelected vs StatePolicy      | **Declarative policy** — `ScreenStatePolicy` replaces imperative `RowSelected` handlers       | Eliminates per-screen boilerplate; single file governs all field states (§16.3)  |
| BQL vs CQRS filters             | **Backend CQRS** — filters are typed DTOs validated by Zod, not embedded queries              | Maintains clean architecture boundary; backend owns query logic (§18)            |

---

## 22. State Taxonomy

> **Full specification:** [Operational Contract §5](OPERATIONAL_CONTRACT.md#5-state-taxonomy)

Every piece of state in the system must belong to exactly one of these six categories. Cross-category state is an architectural violation.

| Category               | Owner Tier        | Storage                       | Lifetime             | Examples                                                                                |
| ---------------------- | ----------------- | ----------------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| **Operational State**  | Backend Authority | PostgreSQL                    | Persistent           | `PaymentRequest.status`, `JournalEntry.posted`, workflow instance state                 |
| **Projection State**   | Platform Runtime  | `ScreenProjection` (computed) | Per-render cycle     | `commandProjections[]`, `fieldOverrides`, `expectedNextAction`, `banner`                |
| **Cached Query State** | Platform Runtime  | TanStack Query cache          | Until invalidation   | Fetched entity data, list results, stats aggregates                                     |
| **Form Edit State**    | Platform Runtime  | TanStack Form                 | Until save/discard   | Dirty field values, validation errors, touched state                                    |
| **Session State**      | Platform Runtime  | Controller instance           | Until screen unmount | OCC version token, stale detection flag, command execution state, mutation coordination |
| **Ephemeral UI State** | UI Rendering      | `ref()` / `reactive()` locals | Until unmount        | Active tab index, dialog open/closed, expanded grid rows, filter panel visibility       |

### 22.1 The Taxonomy Rule

If you cannot place a piece of state into exactly one row of this table, the design is wrong. Common violations:

- A `ref()` that tracks workflow status → **violation** (operational state as ephemeral UI state)
- A computed that checks `if (status === 'DRAFT')` for editability → **violation** (operational inference in platform runtime)
- A Pinia store holding entity data → **violation** (belongs in TanStack Query cache)

### 22.2 Acumatica Mapping

| Acumatica Concept             | State Category     | Notes                                                       |
| ----------------------------- | ------------------ | ----------------------------------------------------------- |
| `PXCache<DAC>` current record | Cached Query State | TanStack Query cache replaces PXCache                       |
| `PXView.Current<>` selection  | Session State      | Controller tracks selected record ID                        |
| `Graph.IsDirty`               | Form Edit State    | TanStack Form `form.state.isDirty`                          |
| `DAC.Status` (DB)             | Operational State  | Backend owns; frontend reads from entity response           |
| `PXAction.Enabled`            | Session State      | Backend `available_actions` determines command availability |
| UI control focus/selection    | Ephemeral UI State | Local `ref()` in component                                  |

---

## 23. Screen Session Model

> **Full specification:** [Operational Contract §6](OPERATIONAL_CONTRACT.md#6-screen-session-model)

The controller (`useScreenController`) is not just a composable — it is a **screen session**. This maps directly to Acumatica's `PXGraph` concept: a `PXGraph` instance IS the active session for a screen, holding the current record, dirty state, and available actions.

| Session Property       | Acumatica Equivalent                         | Source                      | Purpose                          |
| ---------------------- | -------------------------------------------- | --------------------------- | -------------------------------- |
| Loaded entity snapshot | `PXCache<DAC>.Current`                       | TanStack Query              | Last-known server state          |
| OCC version            | `PXDBTimestamp`                              | Backend `version` field     | Stale-write detection            |
| Dirty field graph      | `Graph.IsDirty` + field-level dirty tracking | TanStack Form               | Unsaved edits                    |
| Available commands     | `PXAction.GetState()`                        | Backend `available_actions` | What the user can do             |
| Field capabilities     | `PXFieldState`                               | Backend `field_permissions` | Which fields are editable        |
| Projection             | N/A (implicit in Acumatica)                  | `resolveScreenProjection()` | Deterministic rendering contract |

### 23.1 The Anti-Drift Rule

> The frontend must NEVER infer operational legality from status values. It renders what the backend declares.

This is the single most important architectural rule in the system. When the backend does not provide `field_permissions`, the frontend **fails closed**: all fields render as readonly with a degraded UX banner. No inference. No assumptions.
