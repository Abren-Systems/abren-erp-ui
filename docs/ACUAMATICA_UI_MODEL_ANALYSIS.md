# Acumatica Mental Model → Abren ERP Architecture Alignment

> **Goal:** Deeply understand Acumatica's Modern UI mental model — its hierarchy, taxonomy, relationships, and flow — then document how Abren ERP maps to it. This becomes the definitive reference before any implementation.
> **Status:** Research complete. Awaiting approval to begin documentation updates.

---

## Part 1: The Acumatica Mental Model (Research Synthesis)

### 1.1 The Core Insight: Everything is a Graph

Acumatica's architecture is built around one fundamental concept: **PXGraph** (Business Logic Controller). Every screen in Acumatica is backed by exactly one Graph. The Graph is:

- The **single source of behavior** for that screen
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
                    │  Screen  │ (UI is a renderer)
                    │  (View)  │
                    └──────────┘
```

**Abren Equivalent:** `useScreenController()` + screen-specific controller (e.g., `usePaymentRequestEntry()`). Our controller IS the Graph.

---

### 1.2 The Acumatica UI Hierarchy

Acumatica's UI has **3 persistent regions** and a **center area that transitions between states**. Understanding this hierarchy is essential — the Workspace and Working Area are **NOT side-by-side regions**. They are mutually exclusive states of the same center area.

#### Physical Layout (3 Persistent Regions)

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
│              │  │  Summary, Tabs, Details — see §1.5)  │  │  ual to   │ │
│              │  └──────────────────────────────────────┘  │  record)  │ │
│              │                                            └───────────┘ │
└──────────────┴──────────────────────────────────────────────────────────┘
```

#### The Center Area State Model

The center area is a **state machine** with two states:

| State | Name               | Triggered By                                                | Content                                                   | Side Panel?                                |
| ----- | ------------------ | ----------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------ |
| **A** | **Workspace View** | Clicking a module in the Main Menu                          | Tiles and categorized links to forms, reports, dashboards | **No** — not applicable                    |
| **B** | **Working Area**   | Clicking a link/tile in the Workspace, or direct navigation | A form, report, dashboard, or help topic                  | **Yes** — contextual to the current record |

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

#### The 3 Persistent Regions

| Region          | Acumatica Definition                                                                                            | Abren Equivalent                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Top Pane**    | Persistent chrome bar with Home, Search, Recently Viewed, Timer, Company/Branch, Business Date, Help, User Menu | `AppTopBar` in `AuthenticatedLayout`                |
| **Main Menu**   | Left rail with module entries; can be expanded, collapsed, or minimized to a Menu button in the Top Pane        | `AuthenticatedLayout` sidebar                       |
| **Center Area** | The content region that transitions between Workspace View (tile navigation) and Working Area (form content)    | Vue Router `<RouterView>` + Workspace overlay logic |

#### The 2 Contextual Elements (appear within Center Area states)

| Element                       | Appears In            | Acumatica Definition                                                                                          | Abren Equivalent                     |
| ----------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **Workspace View**            | Center Area (State A) | A navigation surface showing categorized links/tiles to forms, reports, and dashboards of a module            | `WorkspacePanel` component           |
| **Working Area + Side Panel** | Center Area (State B) | The main content area displaying a form/report/dashboard, with an optional contextual Side Panel on the right | `<RouterView>` + `SidePanelContract` |

> [!CAUTION]
> **Workspace ≠ separate region.** The Workspace View and Working Area are **mutually exclusive states** of the same center area. When you're viewing a Workspace, there's no Working Area visible. When you're in a form, the Workspace is dismissed. The Side Panel only exists in the Working Area state.

#### Top Pane Anatomy (8 Elements)

The Top Pane is the persistent chrome bar at the very top of every Acumatica screen. It contains exactly 8 elements:

| #   | Element                        | Purpose                                                                                                                                           | Abren Mapping                             |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | **Home Button**                | Shows company logo; navigates to home page (configurable per-user via User Profile)                                                               | `AppTopBar` logo/home link                |
| 2   | **Search Box**                 | Global search across the entire system — records, forms, reports                                                                                  | ❌ Not built (documented as Phase 2)      |
| 3   | **Recently Viewed**            | Opens a workspace overlay showing most recently created/opened records from data entry and maintenance forms, with key details (ref numbers, IDs) | ❌ Not built                              |
| 4   | **Timer**                      | Project task time tracking (Clock In/Out/Pause/Resume); timer area shows in Top Pane shaded green (running) or yellow (paused)                    | ❌ Not applicable yet (no PM module)      |
| 5   | **Company & Branch Selection** | Shows current company/branch; dropdown to switch between accessible companies and branches                                                        | Tenant selector in `AuthenticatedLayout`  |
| 6   | **Business Date**              | Shows current business date/time in user's timezone; calendar to override business date (used as default date in new records)                     | ❌ Not built — critical for financial ERP |
| 7   | **Open Help**                  | Opens Help menu with links relevant to the current Working Area content                                                                           | ❌ Not built                              |
| 8   | **User Menu**                  | Shows tenant, username, email, last sign-in; links to User Profile and Sign Out                                                                   | User dropdown in `AuthenticatedLayout`    |

> [!IMPORTANT]
> **Business Date (#6) is critical for a financial ERP.** All transaction records (invoices, JEs, payments) use the Business Date as their default date. This is NOT just `new Date()` — it's a user-overridable system concept that must be available globally.

---

### 1.3 Form Kinds (What Appears in the Working Area)

Acumatica classifies every **form** into one of these functional kinds. Each kind has a distinct layout contract, toolbar behavior, and data flow. This is the grammar of the system — it is NOT optional:

| #   | Kind            | Acumatica Term    | Purpose                                                    | Layout Pattern                                                    | Abren `ScreenKind` | Screen ID Area Code |
| --- | --------------- | ----------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- | ------------------ | ------------------- |
| 1   | **Setup**       | Preferences/Setup | System configuration, numbering sequences, posting rules   | Single form, no header-detail, minimal toolbar                    | `setup`            | `10`                |
| 2   | **Maintenance** | Master Data       | Create/edit reference entities (Customers, Vendors, Items) | Single-record form with tabs, no line grid                        | `maintenance`      | `20`                |
| 3   | **Data Entry**  | Transaction Entry | Create/edit transactional documents (Bills, Orders, JEs)   | **Header + Detail Grid** with summary area, tabs, line items      | `dataEntry`        | `30`                |
| 4   | **Inquiry**     | Generic Inquiry   | Read-only filtered analysis, drilldown                     | Full-width grid with filters, side panel for context              | `inquiry`          | `40`                |
| 5   | **Processing**  | Batch Processing  | Select multiple records, execute server-side action        | Grid with `Selected` checkbox column, Process/Process All buttons | `processing`       | `50`                |
| 6   | **Report**      | Report            | Data organized in a ready-to-print format                  | Parameter form + rendered output                                  | `report`           | `60`                |

In addition to forms, the Working Area can display:

| Content Type  | Acumatica Definition                                                                | Abren `ScreenKind` |
| ------------- | ----------------------------------------------------------------------------------- | ------------------ |
| **Dashboard** | A collection of widgets on a single page providing at-a-glance business information | `dashboard`        |

> [!IMPORTANT]
> **Key Insight:** The form kind determines the entire UX contract. A `dataEntry` form always has a summary area (fieldsets) + tabs + detail grid. A `processing` form always has a selectable grid + Process button. A `dashboard` is NOT a form — it is a widget container.

---

### 1.4 The Screen ID System

Acumatica screen IDs are **8-character codes** with strict semantic meaning:

```
  AP 30 10 00
  ── ── ── ──
  │   │  │  └── Variant/Version (00 = primary)
  │   │  └───── Sequence within functional area
  │   └──────── Functional Area Code (maps to Form Kind)
  └──────────── Module Prefix
```

**Functional Area Codes (linked to Form Kinds above):**
| Code | Area | Form Kind |
|------|------|-------------|
| `10` | Setup | Preferences, configuration |
| `20` | Maintenance | Master data (entities) |
| `30` | Data Entry | Transaction documents |
| `40` | Inquiry | Read-only filtered views |
| `50` | Processing | Batch operations |
| `60` | Reports | Parameterized reports |

**Module Prefixes (Abren):**
| Prefix | Module | Examples |
|--------|--------|----------|
| `AP` | Accounts Payable | AP301000 (Bills), AP3010PL (Bill List) |
| `GL` | General Ledger | GL301000 (Journal Entry) |
| `CA` | Banking | CA202000 (Bank Accounts) |
| `TX` | Tax | TX201000 (Tax Groups) |
| `IN` | Inventory | IN202000 (Stock Items), IN301000 (Adjustments) |
| `CR` | Core (Users/Roles) | CR201000 (Users), CR301000 (Roles) |

**The `PL` suffix:** Acumatica uses `PL` (Primary List) as a suffix to denote the inquiry/list form paired with a data entry form. E.g., `AP301000` = Payment Request Detail, `AP3010PL` = Payment Requests List. The PL form is the **Workspace's link target** — clicking a Workspace menu item opens a PL (inquiry grid), from which the user navigates to the data entry form.

---

### 1.5 The Form Anatomy (from Acumatica's End-User Guide)

Every Acumatica form in the Working Area has **6 basic parts**. This structure is mandatory — the framework enforces it:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. FORM TITLE BAR                                               │
│    Form Title                                                    │
│    Record ID - Record Title          [📝Note] [📧Activities] [📎Files] [⚙Settings] │
├─────────────────────────────────────────────────────────────────┤
│ 2. FORM TOOLBAR                                                  │
│    [←][→][📋][↩][+][🗑][📋▾] |K|◁|▷|▷| [Expected Next ▶] [Cmd] [···More] │
│    ├─ standard buttons ──────────┤  ├─ highlighted ─┤        ├─ More ─┤ │
├─────────────────────────────────────────────────────────────────┤
│ 3. SUMMARY AREA (collapsible via ▲ arrow)                 [▲]   │
│    ┌──────────────┐ ┌───────────────┐ ┌─────────────────┐       │
│    │ Section A     │ │ Section B      │ │ Section C (totals)│    │
│    │ Order Type  IN│ │ Customer TOMYUM│ │ Ordered Qty  1.00│    │
│    │ Order Nbr  057│ │ Location  MAIN │ │ Detail Total 4100│    │
│    │ Status Invoiced│ │ Contact       │ │ Tax Total    0.00│    │
│    │ Date    1/7/25│ │ Project    X   │ │ Order Total  4100│    │
│    └──────────────┘ └───────────────┘ └─────────────────┘       │
├─────────────────────────────────────────────────────────────────┤
│ 4. TABS                                                          │
│    [DETAILS] [TAXES] [FINANCIAL] [SHIPPING] [ADDRESSES] [...]    │
├─────────────────────────────────────────────────────────────────┤
│ 5. DETAILS AREA (content of active tab)                          │
│    Tab-level toolbar: [↻][+][×] [Add Items] [Line Details] ...   │
│    ┌────────────────────────────────────────────────────────┐    │
│    │ 6. ROW (line/detail)                                   │    │
│    │    ▸ 📄 SWEETEQUIP  INSTALL  EQUIPHOUSE  HOUR  1.00   │    │
│    │      📄 SWEETEQUIP  JUICER20C EQUIPHOUSE PIECE 1.00   │    │
│    └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

#### Part 1: Form Title Bar

The title bar displays the **form title** and **record title** (for data entry forms). It also contains buttons for record-level services:

| Button            | Purpose                                                                            | Abren Mapping                                    |
| ----------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| **📝 Notes**      | Create and attach a note to the selected record                                    | ❌ Not built — needs `RecordNotes` service       |
| **📧 Activities** | Create tasks, events, emails related to the record; opens in new browser tab       | ❌ Not built — needs `RecordActivities` service  |
| **📎 Files**      | Attach files to the record                                                         | ❌ Not built — needs `RecordAttachments` service |
| **⚙ Settings**    | Access form-related info and customization (Screen Configuration, Personalization) | ❌ Not built                                     |

> [!NOTE]
> These title bar buttons are **record-level services** — they belong to the Title Bar, NOT the Toolbar. This is a key distinction: the Toolbar has document-level commands (Save, Release), while the Title Bar has record-level attachments (Notes, Files, Activities).

#### Part 2: Form Toolbar & More Menu

The toolbar contains **three types of buttons**, and has a **responsive layout** that adjusts to screen size:

**Standard Buttons** (appear on most forms):

- Save, Cancel (discard changes)
- Add (new record), Delete
- Copy (duplicate), Undo
- Navigation: First (`|◁`), Previous (`◁`), Next (`▷`), Last (`▷|`)

**Highlighted Button (Expected Next Action):**

- The system analyzes the record's current status and highlights the **next logical step** as a prominent colored button (e.g., green `[Open]` when status is New)
- This same command also appears in the More Menu with a **green dot** indicator

**More Menu** (opened via `···` button):
The More Menu contains **all** commands organized into categories:

| Element                 | Description                                                                            | Abren Mapping                                             |
| ----------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Category title**      | Groups related commands (e.g., "Processing", "Activities", "Record Creation", "Other") | `ScreenCommand.categoryKey` — typed but not rendered      |
| **Green dot (●)**       | Marks the expected next command (same as the highlighted toolbar button)               | `ScreenCommand.expectedNext` — typed but not rendered     |
| **Star icon (★)**       | User can mark favorite commands; favorites get promoted to the toolbar                 | `ScreenCommand.favoriteEligible` — typed but not rendered |
| **Available command**   | Clickable; may also appear as a button on the toolbar if common                        | `ScreenCommand.isVisible`                                 |
| **Unavailable command** | Greyed out; not applicable to the record's current status                              | `ScreenCommand.isEnabled`                                 |

**Responsive behavior:**

- When screen is wide: highlighted + favorite commands shown as toolbar buttons
- When screen shrinks: commands move off toolbar one by one, but remain in More Menu
- Multiple categories → multi-column layout; smaller screens → fewer columns → single column

#### Part 3: Summary Area (or Selection Area)

The content of this zone **varies by form kind**:

| Form Kind                | Zone Name         | Content                                               | Behavior                                                                |
| ------------------------ | ----------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| **Data Entry**           | Summary Area      | General info: date, ID, status, customer, description | Collapsible (▲ arrow hides less essential fields, keeps most important) |
| **Maintenance**          | Summary Area      | Entity identifier and key attributes                  | Same collapsible behavior                                               |
| **Inquiry / Processing** | Selection Area    | Filter criteria to narrow records in Details Area     | Not collapsible                                                         |
| **Setup (Preferences)**  | Settings sections | General settings for the functional area              | Not collapsible                                                         |

UI elements are grouped into **color-coded sections** (fieldsets). Users can personalize which elements are visible; admins can change it system-wide.

#### Part 4: Tabs

Tabs organize information into logical sections. Most data entry forms have multiple tabs. Related UI elements within a tab are grouped into sections. Users can personalize which tabs are visible.

#### Part 5: Details Area

The Details Area can contain **three types of content** depending on the form and tab:

| Content Type                        | Example                          | Abren Component                 |
| ----------------------------------- | -------------------------------- | ------------------------------- |
| **Table with rows** (lines/details) | Sales Order lines on Details tab | `AppGrid` / TanStack Table      |
| **UI elements with settings**       | Customer settings on General tab | `AppFieldset` groups            |
| **Rich text editor**                | Case description on Details tab  | Rich text component (not built) |

#### Part 6: Row (Line / Detail)

Each row in a Details Area table is a **detail of the selected record**. Users can personalize which columns are visible. A single form can have multiple tables across different tabs (e.g., SO301000 has line items on Details tab and tax rows on Taxes tab).

---

### 1.7 The Data View Pattern

Acumatica's Graph exposes data through **named Data Views**. Each view is a query bound to a DAC (Data Access Class). The UI binds to views, not to raw data.

```csharp
// Acumatica C# — PXGraph
public class APBillEntry : PXGraph<APBillEntry, APInvoice>
{
    // Primary View — drives toolbar actions and record navigation
    public PXSelect<APInvoice> Document;

    // Detail View — line items grid
    public PXSelect<APTran,
        Where<APTran.refNbr, Equal<Current<APInvoice.refNbr>>>>
        Transactions;

    // Lookup View — for selectors/dropdowns
    public PXSelect<Vendor> Vendors;
}
```

**Abren Mapping — `ScreenDefinition.views`:**

```typescript
views: {
    paymentRequest: {         // ← Primary View (single record)
        name: 'paymentRequest',
        kind: 'single',
        containerName: 'PaymentRequestEntry',
        queryKey: ['ap', 'payment-requests', 'detail'],
    },
    lines: {                  // ← Detail View (collection)
        name: 'lines',
        kind: 'collection',
        containerName: 'PaymentRequestLines',
        queryKey: ['ap', 'payment-requests', 'lines'],
    },
}
```

This is well-aligned. The `views` concept maps directly to Acumatica's Data Views.

---

### 1.8 The Workflow Engine (State Machine)

Acumatica's Workflow Engine is a **declarative finite state machine** that governs:

- Which **states** a document can be in (Hold, Open, Released, Closed, Voided)
- Which **actions** are available in each state (Remove Hold, Release, Void)
- Which **transitions** actions cause (Hold → Open, Open → Released)
- What **conditions** must be met for a transition (e.g., "total > 0")
- What **dialog boxes** appear during transitions (e.g., rejection reason)

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

**Abren Mapping — Dual-Layer State Machine:**

```
UI State:     INITIALIZING → VIEW → EDIT → SAVING → VIEW
Domain State: DRAFT → SUBMITTED → APPROVED → AUTHORIZED (owned by backend)
```

This is conceptually correct. The UI state tracks presentation concerns, while the Domain state (from the backend) drives command visibility.

---

### 1.9 The Side Panel Model

Acumatica's side panel is NOT a drawer — it's an **icon strip** on the right edge where each icon hosts a **full embedded screen**:

- 📋 **Record Services** — Notes, Files, Activities for the current record
- 📊 **Related Screen** — Another full screen (e.g., Customer Details from SO)
- 💬 **Activities** — Communication history linked to the record

Key property: the side panel is **contextual** — it automatically receives the current record's key as a parameter. When you click a row in a list, the side panel refreshes with that row's context.

**Abren Mapping:** `SidePanelContract` with `SidePanelLocalTab` (local content) and `SidePanelScreenTab` (embedded screen). This is well-designed but needs:

- ❌ **RecordServicesMenu** component (Notes/Files/Activities tabs)
- ❌ Context-binding to grid row selection
- ❌ Collapse/expand icon strip chrome

---

### 1.10 The Workspace & Main Menu Model

Per Acumatica's end-user guide, the **Workspace** is a menu (not a screen). The **Main Menu** contains Workspace menu items. When you click a Workspace menu item, the corresponding Workspace opens **over the Working Area** showing links to forms, reports, and dashboards.

```
MAIN MENU (left rail — expanded / collapsed / minimized)
├── 🏠 Home
├── 📊 Finance (Workspace menu item)
│   Opens Finance Workspace:
│   ├── Links to Forms: Bills, Checks, Vendors, JEs, CoA
│   ├── Links to Reports: AP Aging, Trial Balance
│   ├── Links to Dashboards: Finance Overview
│   └── Favorites (user-pinned)
├── 📦 Distribution (Workspace menu item)
│   Opens Distribution Workspace:
│   ├── Links to Forms: Inventory, Sales Orders, POs
│   └── ...
├── ⚙️ Organization (Workspace menu item)
│   └── Users, Roles, Branches
└── 🔍 Global Search
```

**Key behaviors from Acumatica's guide:**

- Main Menu can be **expanded** (full names), **collapsed** (compact), or **minimized** (Menu button in top pane)
- Workspace menu items open the Workspace **overlay** with categorized links
- Users can add forms/reports/dashboards to **Favorites** within a Workspace
- Clicking a link in the Workspace navigates to a form/report/dashboard in the **Working Area**

**Abren Mapping:** `ModuleDefinition.menuItems` + `workspaceEntries`. The Main Menu is `AuthenticatedLayout` sidebar. Workspace overlays need implementation.

---

### 1.11 The Layout Template System

Acumatica's `qp-template` defines **named column proportions** for form layouts:

| Template Name | Column Ratio | Usage                                           |
| ------------- | ------------ | ----------------------------------------------- |
| `1`           | Full width   | Single-column setup forms                       |
| `1-1`         | 50/50        | Two-column maintenance                          |
| `1-1-1`       | 33/33/33     | Three equal columns                             |
| `7-17`        | ~30/70       | Narrow summary + wide detail                    |
| `17-7`        | ~70/30       | Wide summary + narrow sidebar                   |
| `7-10-7`      | ~29/42/29    | AP-style: ID left, details center, totals right |

These templates can **nest** — you can put a `1-1` template inside one slot of a `1-1-1`.

**Abren Mapping:** `ScreenDefinition.layout.summaryTemplate` has this typed. The missing piece is `AppTemplate` — the Vue component that reads the template name and generates the CSS Grid layout.

---

## Part 2: Gap Analysis — What Our Docs Must Establish

Based on the Acumatica mental model, here is what our architecture documentation must formally cover:

### 2.1 Concepts That Are Well-Mapped (Keep & Polish)

| Acumatica Concept                                         | Abren Implementation                                 | Status                                                     |
| --------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| PXGraph → Controller                                      | `useScreenController()` + screen-specific controller | ✅ Solid                                                   |
| DAC → Domain types                                        | `domain/*.types.ts` with branded IDs                 | ✅ Solid                                                   |
| Data Views                                                | `ScreenDefinition.views`                             | ✅ Well-designed                                           |
| Form taxonomy (6 kinds + dashboard)                       | `ScreenKind` union type                              | ⚠️ Needs `dashboard` kind, clarify Workspace is NOT a kind |
| Screen ID system                                          | `ScreenId` branded type + `{Module}{Area}{Seq}`      | ✅ AP demonstrates                                         |
| qp-fieldset → AppFieldset                                 | `AppFieldset` + `FieldGroup`                         | ✅ Working                                                 |
| qp-field → AppField                                       | `AppField` with field registry                       | ✅ Working                                                 |
| Dual-layer state machine                                  | `ScreenStateMachine` (UI + Domain layers)            | ✅ Implemented                                             |
| Field definitions                                         | `FieldDefinition` with state-aware readonly/required | ✅ AP demonstrates                                         |
| Data flow (Adapter → Schema → Mapper → Composable → View) | Infrastructure layer                                 | ✅ Consistent                                              |

### 2.2 Concepts That Are Typed But Not Yet Rendered

| Acumatica Concept                      | Abren Type                       | Missing Implementation     |
| -------------------------------------- | -------------------------------- | -------------------------- |
| Expected Next Action (green highlight) | `ScreenCommand.expectedNext`     | No rendering logic         |
| More menu with categories              | `ScreenCommand.categoryKey`      | No `MoreMenu` component    |
| Command favorites (★)                  | `ScreenCommand.favoriteEligible` | No persistence or UI       |
| Layout templates rendering             | `LayoutTemplate` type            | No `AppTemplate` component |
| Personalization policy                 | `ScreenPersonalizationPolicy`    | No user settings storage   |

### 2.3 Concepts That Are Missing Entirely

| Acumatica Concept                                                | Impact                                          | Priority                 |
| ---------------------------------------------------------------- | ----------------------------------------------- | ------------------------ |
| **RecordServicesMenu** (Notes/Files/Activities)                  | Every data entry screen needs this              | P1 — design contract now |
| **Toolbar component** (standard actions + More menu + favorites) | Currently hand-coded in every screen's view.vue | P0 — must extract        |
| **AppTemplate** (qp-template equivalent)                         | Summary area layout is ad-hoc CSS               | P1 — component needed    |
| **Screen Configuration** (user personalization UI)               | Not started                                     | P2 — design later        |
| **Global Search / Command Surface** (⌘K)                         | Not started                                     | P2                       |
| **Workspace tiles / KPI widgets**                                | Not started                                     | P2                       |
| **Processing screen pattern** (Select + Process All)             | No screen of this kind exists yet               | P2 — document pattern    |

---

## Part 3: Proposed Documentation Action Plan

### Phase 1: Lock the Mental Model (Docs First, No Code)

Before writing any implementation code, create/update these documents:

#### 1. Create: `docs/architecture/ACUMATICA_ALIGNMENT.md` (NEW)

The Rosetta Stone document. Maps every Acumatica concept to its Abren equivalent with examples. This IS the document you're reading now, cleaned up and formalized.

**Contents:**

- The 4-region UI hierarchy (Workspace, Working Area, Side Panel, Main Menu)
- The PXGraph ↔ Controller mapping
- The 6 form kinds + dashboard (Working Area content types)
- Workspace as navigation concept (NOT a screen kind)
- The Screen ID numbering system for Abren modules
- The 6-zone form anatomy
- The toolbar/command model
- The Data View ↔ `ScreenDefinition.views` mapping
- The state machine ↔ workflow engine mapping

#### 2. Update: `docs/architecture/SCREEN_RUNTIME.md`

Add the missing concepts:

- **Toolbar rendering rules** (Expected Next Action, More Menu, categories)
- **Side Panel contextual binding** (how grid row selection feeds the panel)
- **RecordServicesMenu** contract specification
- **AppTemplate** rendering specification (template name → CSS Grid)

#### 3. Update: `docs/architecture/COMPONENT_SYSTEM.md`

Formalize the component hierarchy with clear ownership and build status:

- Mark which components are ✅ built, ⚠️ typed-only, ❌ missing
- Add `AppTemplate`, `ScreenToolbar`, `MoreMenu`, `RecordServicesMenu` specifications

#### 4. Create: `docs/architecture/SCREEN_MIGRATION.md` (NEW)

Step-by-step guide for converting a legacy `pages/components/` screen to the locked Screen ID pattern. Uses AP301000 as the canonical example.

#### 5. Fix: `docs/architecture/API_INTEGRATION.md`

Rewrite from scratch — current version is broken beyond editing (duplicate sections, orphaned code blocks).

#### 6. Update all docs with stale paths

Fix `application/composables/` references, underscore adapter naming, Pinia-first data flow diagrams.

### Phase 2: Implement the Missing Platform Components

After docs are locked, build the components in order:

1. `ScreenToolbar.vue` — renders commands from the controller, handles Expected Next Action highlighting and More menu
2. `AppTemplate.vue` — renders the named column template as CSS Grid
3. `MoreMenu.vue` — categorized action overflow menu with favorites support
4. Update `scaffold-module.js` to generate the Screen ID structure

### Phase 3: Migrate Screens Systematically

With the platform in place, migrate module by module:

1. AP Vendor Bills → `AP302000` / `AP3020PL`
2. Ledger Journal Entries → `GL301000` / `GL3010PL`
3. Ledger Chart of Accounts → `GL201000` / `GL2010PL`
4. Continue for remaining modules

---

## Resolved Decisions

### ✅ Q1: Maintenance vs. Data Entry — Keep Separate (Acumatica's Way)

**Decision:** Keep them separate, exactly as Acumatica does. Their approach is tested and proven at scale.

- `maintenance` (area code `20`) — Master data forms (Vendors, Items, Customers). Single-record with tabs, no line-item detail grid.
- `dataEntry` (area code `30`) — Transaction documents (Bills, JEs, Orders). Header + Detail Grid with summary area, tabs, line items.

The framework must enforce layout contracts per kind.

---

### ✅ Q2: ActionContract → ScreenCommand — Adopt Acumatica's Two-Layer Hybrid

**Research — How Acumatica Handles Commands:**

Acumatica uses a **two-layer model** for commands:

**Layer 1: Declaration (Data Object)** — `PXAction<T>` + attributes

```csharp
public PXAction<APInvoice> Release;
[PXButton(CommitChanges = true, DisplayOnMainToolbar = true)]
[PXUIField(DisplayName = "Release")]
protected virtual void release() { /* logic */ }
```

The action is declared as a **data member** on the Graph. Attributes control display name, whether it commits changes, and whether it should appear on the main toolbar.

**Layer 2: Workflow Configuration (Placement/Visibility)** — Fluent API

```csharp
actions.Add(g => g.Release, a => a
    .WithCategory(PredefinedCategory.Processing)  // More Menu category
    .IsDuplicatedInToolbar()                       // Also show as toolbar button
    .IsDisabledWhen(conditions.IsNotOpen)           // Grey out when not applicable
);
```

The workflow controls: which category it belongs to, whether it appears on the toolbar, and under which conditions it's enabled/disabled. **Workflow configuration overrides static attributes.**

**Decision for Abren:** Converge on an `ActionContract`-style **declarative data object** (matching Layer 1) with a **platform-level resolver** (matching Layer 2):

```typescript
// Layer 1: Declaration in commands.ts (data object, not a class with methods)
export const releaseCommand: ScreenCommand = {
  key: 'release',
  labelKey: 'ap.AP301000.actions.release',
  icon: 'check-circle',
  categoryKey: 'processing', // More Menu category
  displayOnMainToolbar: true, // Also show on toolbar
  expectedNext: (state) => state.domainStatus === 'OPEN',
  isVisible: (state) => ['OPEN', 'SUBMITTED'].includes(state.domainStatus),
  isEnabled: (state, data) => data.total > 0,
  execute: (controller) => controller.executeAction('release'),
}

// Layer 2: Platform resolver reads these properties and renders
// the toolbar + More Menu automatically. No hand-coding per screen.
```

This means:

- **Deprecate** the method-based `ScreenCommand` interface from `command.types.ts`
- **Converge** on `ActionContract`-style flat data objects as the single command type
- **Build** a platform `ScreenToolbar` component that reads commands and handles responsive layout, Expected Next Action, favorites, and More Menu rendering

---

### ✅ Q3: Processing Screens — Deferred

**Decision:** Defer the Processing screen kind until other aspects of the implementation deepen. Document the pattern specification now but don't implement.

---

### ✅ Q4: i18n Key Format — Define Now, Implement Later

**Decision:** Define the key format convention now so all new code uses consistent keys, even before the full i18n infrastructure is built. Keys should be string literals that can be later resolved by a translation system.

**Format:** `{module}.{screenId}.{section}.{key}`

Examples:

```
ap.AP301000.summary.vendor       → "Vendor"
ap.AP301000.summary.status       → "Status"
ap.AP301000.actions.release      → "Release"
ap.AP301000.actions.submit       → "Submit for Approval"
ap.AP301000.tabs.details         → "Document Details"
ap.AP301000.tabs.financial       → "Financial"
gl.GL301000.summary.batchNumber  → "Batch Number"
```

For now, use the key as the fallback display string. When i18n is implemented, these keys become lookup identifiers.

---

### ✅ Q5: Scope — Documentation First, No Code Until Docs Are Locked

**Decision:** "We don't do what we did not document." Phase 1 (documentation) is the sole deliverable of this conversation. No implementation code until all architecture documents are reviewed and approved.

**Deliverables for this conversation:**

1. `ACUMATICA_ALIGNMENT.md` — The Rosetta Stone (this plan, formalized)
2. Updated `SCREEN_RUNTIME.md` — With toolbar/command/side panel specs
3. Updated `COMPONENT_SYSTEM.md` — With build status markers
4. New `SCREEN_MIGRATION.md` — Step-by-step legacy → Screen ID migration guide
5. Rewritten `API_INTEGRATION.md` — From scratch
6. Stale path fixes across all docs
