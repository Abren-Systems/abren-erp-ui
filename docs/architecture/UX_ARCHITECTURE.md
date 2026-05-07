---
title: 'Abren ERP — The Composable Business Operating System (UX Architecture)'
description: "Before implementing the frontend views for Horizon A modules, we are establishing our ultimate UX/UI philosophy. We are elevating Abren from a 'nice-looking CRUD system' to a **Composable Business Ope"
tier: frontend
tags: [frontend, architecture]
---

# Abren ERP — The Composable Business Operating System (UX Architecture)

> **Version:** 2.0
> **Status:** AUTHORITATIVE — This document dictates the UX and Interaction Philosophy for the Abren ERP frontend.
> **Last Updated:** May 2026
> **Companions:** [Architecture Manifesto](./ARCHITECTURE.md) · [Field System](../FIELD_SYSTEM.md) · [Design System](./DESIGN_SYSTEM.md) · [Screen Runtime](./SCREEN_RUNTIME.md) · [Component System](./COMPONENT_SYSTEM.md)

> **Global Principle**: "Operations are the source of truth. Accounting is the guaranteed consequence."

Our True North Star is a synthesis of proven enterprise patterns (Acumatica, SAP Fiori, Dynamics 365), filtered through an Abren-owned product language:

- **Structure**: Sequential Progressive Disclosure (Step-by-step Task Progression)
- **Interaction**: **Headless accessibility + Abren-owned primitives** (behavior from infrastructure, product identity from Abren)
- **Aesthetic**: **Calm operational density** (serious, modern, trustworthy, low-theater)
- **Workflow**: Linear (State-driven UX clarity isolated by Routing)
- **Financial UX**: Traceability via Contextual Side Panels
- **Architecture**: **The Four Layers of Authority** (Platform, Semantic Kernel, Business Modules, Projections).

---

## 0. The Three Persistent Regions (App Shell)

Every screen in Abren ERP exists within a rigid macro-architecture. The shell has **3 persistent regions** and a **center area that transitions between states** (see [Acumatica Alignment §2](ACUMATICA_ALIGNMENT.md#2-the-ui-hierarchy-3-persistent-regions--center-area-state-machine)). We enforce **Semantic Normalization** across these regions—ensuring that business concepts (like "Paid" status) carry the same visual and business authority everywhere.

```text
┌──────────────────────────────────────────────────────────────────┐
│                     TOP PANE (Global Bar)                       │
│  [🏠Home] [🔍Search] [🕐Recent] [⏱Timer] [Company▾] [Date▾] [?] [👤User▾]  │
├──────────┬─────────────────────────────────────────────────────┤
│          │              CENTER AREA                             │
│ MAIN     │  (transitions between states)                       │
│ MENU     │                                                     │
│ (left    │  State A: WORKSPACE VIEW                            │
│  rail)   │  ┌─────────────────────────────────────────────┐    │
│          │  │ Tiles & links to forms, reports, dashboards │    │
│          │  └─────────────────────────┬───────────────────┘    │
│          │                            │ click a link           │
│          │                            ▼                        │
│          │  State B: WORKING AREA              ┌───────────┐   │
│          │  ┌──────────────────────────────┐   │ SIDE      │   │
│          │  │ Form Title Bar               │   │ PANEL     │   │
│          │  │ Form Toolbar                 │   │ (context- │   │
│          │  │ Summary Area                 │   │  ual to   │   │
│          │  │ Tabs & Details               │   │  record)  │   │
│          │  └──────────────────────────────┘   └───────────┘   │
└──────────┴─────────────────────────────────────────────────────┘
```

### 0.1 Top Pane

**Component:** `AuthenticatedLayout` header section (`sticky top-0 z-20`).
**Contents:** Home, Global Search, Recently Viewed, Timer, Company/Branch, Business Date, Help, User Menu.
**Constraint:** Must never contain module-specific actions or state.

### 0.2 Main Menu (Navigation)

**Component:** `AuthenticatedLayout` aside section.
**Structure:** Module entries (Finance, Distribution, Organization, etc.).
**Constraint:** Driven by workspace configuration, registered screens, and RBAC permissions. Three modes: expanded (full names), collapsed (icons), minimized (Menu button in Top Pane).

### 0.3 Center Area — State A: Workspace View

**Purpose:** A navigation surface showing categorized links/tiles to forms, reports, and dashboards of a module. Entered when a module is clicked in the Main Menu.
**Components:** `WorkspaceView` which renders `WorkspaceCategoryPanel` for categorized links, tiles, favorites, and queue counts.
**Constraint:** Workspace View and Working Area are **mutually exclusive states** of the center area. No Side Panel in this state. It is strictly a capability discovery and navigation surface.

### 0.4 Center Area — State B: Working Area

**Purpose:** The dedicated canvas for performing actual work. Entered when a link/tile is clicked in the Workspace View, or via direct URL navigation. It represents a strict transaction or inquiry boundary.
**Components:** The screen runtime payload rendered through a `ScreenRenderer` using the controller/view pattern (`controller.ts` → `view.vue`).
**Internal Anatomy** (see [Acumatica Alignment §5](ACUMATICA_ALIGNMENT.md#5-form-anatomy-6-basic-parts)):

- **Form Title Bar** — `FormTitleBar` with form title, record title, and the **RecordServicesMenu** (Notes, Activities, Files, Settings).
- **Form Toolbar** — `FormToolbar` with standard buttons, Expected Next Action, and More Menu.
- **Summary Area** — `AppTemplate` + `AppFieldset` groups for high-level record data.
- **Details Area** — `AppTabs` containing `DataGrid`, `AppFieldset` sections, or audit history.
- **Side Panel** — `AppSidePane` for contextual record details (icon strip with tabs).
  **Constraint:** The Working Area is the **exclusive domain of the Field System** (`AppField`, `AppFieldset`). No raw HTML layouts. See [Field System Architecture](../FIELD_SYSTEM.md).

---

## 1. Priority-Driven Workspaces (Not Just Roles)

Roles are too rigid for SMEs where one person wears five hats. We will use **Role + Context + State-based UX**.

- **Dynamic Launchpad**: The workspace leads with what needs attention _right now_, driven by our Decentralized Gatekeeper and Workflow engines:
  - "5 Payment Requests Awaiting Approval"
  - "2 Inventory Adjustments Pending Count"
  - "3 Vendor Bills Unmatched"
- **The Rule**: Every action in the system must instantly answer: _What needs attention? What can I do now? What will happen if I do it?_

---

## 2. Sequential Progressive Disclosure Flow (The Anti-Dashboard)

We explicitly reject the "Hub-and-Spoke," "Tri-Pane Workspace," and monolithic dashboard patterns for transactional operations. High information density in parallel panes leads to **Dashboard Syndrome**: cognitive overload, split-focus fatigue, and catastrophic error propagation for SME users.

Instead, we use a **Screen-Driven Progressive Disclosure** flow. Each stage is an isolated screen instance or overlay — never a simultaneously competing pane.

### 2.1. State Transition Flow

```text
[Workspace View] → [Working Area Screen] → [Side Panel] → [Action Dialog]
```

- **Workspace View (State A)**: Categorized tiles/links for scanning and navigating to work.
- **Working Area (State B)**: Single entity focus via Screen ID screens (e.g., `AP301000`), governed by the 6-part form anatomy.
- **Side Panel**: On-demand contextual details (icon strip tabs).
- **ActionModal**: Explicit confirmation for destructive actions.

### 2.2. Component Interaction Contract

The primary flow for transactional operations:

```text
┌────────────────────────────────────────────────────────┐
│ Inquiry Screen (e.g., AP3010PL)                        │
│  - WORKSPACE VIEW → navigates here                     │
│  - Smart Filter Bucket Tabs + DataGrid                 │
│  - DataGrid footer: row count, total, selection count  │
│  - Bulk Action bar (appears when selectedCount > 0)    │
│  - Docked Side Panel shows context for selected row    │
│      Does NOT mutate; navigates to data entry screen   │
└─────────────────────────┬──────────────────────────────┘
                          │ click row / open screen
                          ▼
┌───────────────────────────┐
│ Data Entry Screen         │
│  (e.g., AP301000)         │
│  - Form Title Bar         │
│  - Form Toolbar           │
│  - Summary Area           │
│  - AppTabs + DataGrid     │
│  - Side Panel (tabs)      │
│  - ActionModal            │
└───────┬─────────┬─────────┘
        │         │
        ▼         ▼
┌─────────────┐   ┌────────────────┐
│ Side Panel  │   │ ActionModal    │
│ (icon tabs) │   │  Confirm void  │
│  - Audit    │   │  Confirm delete│
│  - Files    │   │                │
└─────────────┘   └────────────────┘
```

> **Rule:** The inquiry screen's Side Panel is read-only. It shows contextual details. Any mutation (approve, edit, reject) must navigate the user into the data entry screen. This preserves state isolation.

### 2.3. The 3 Stages of Operational Focus

1. **The Workspace View (State A)**: Clicking a module in the Main Menu shows categorized tiles/links. Clicking a tile navigates to an inquiry or data entry screen.
2. **The Working Area (State B)**: The center area transitions to the screen. The Workspace View disappears. The user focuses purely on doing the work. The screen renders using the 6-part form anatomy (`FormTitleBar`, `FormToolbar`, Summary Area, Tabs, Details). Primary state-advancing actions are prominent via Expected Next Action; destructive actions require `ActionModal` confirmation.
3. **The Side Panel**: "No number without an origin" — but it is lazy-loaded. Audit histories, underlying vendor bills, and financial impact projections sit behind icon strip tabs in the Side Panel, appearing only when the user invokes them. When they are done investigating, they collapse the panel and return to the focused context.

### 2.4. Density Management Rules

Each stage has an explicit density contract:

| Stage              | Density                                    | Rationale                                                      |
| :----------------- | :----------------------------------------- | :------------------------------------------------------------- |
| **Workspace View** | Maximum — compact tiles, categorized links | Scanning speed is paramount                                    |
| **Inquiry (List)** | Maximum — compact rows, minimal chrome     | Scanning and triage speed                                      |
| **Data Entry**     | Moderate — readable forms, clear sections  | Accuracy over speed                                            |
| **Side Panel**     | Compact — dense timeline, minimal padding  | Supporting context, not primary work                           |
| **ActionModal**    | Minimal — interruptive clarity             | Destructive actions demand singular, undistracted confirmation |

### 2.5. Layered Context & Tiered Contrast (Dynamics 365 Standard)

We utilize a three-tier contrast system to create structural depth without heavy shadows or borders:

1.  **Level 0: The Canvas (`#faf9f8`)**: The "desk" — a neutral, pale gray background for the entire application.
2.  **Level 1: The Nav Anchor (`#f3f2f1`)**: The sidebar — a slightly deeper gray that houses stable navigational elements.
3.  **Level 2: The Action Surface (`#ffffff`)**: The "paper" — stark white containers (Grids, Forms, Detail cards) that float atop the canvas to signify interactive focus.

> **Principle**: High-density ERP data must always live on a **Level 2 (White)** surface to ensure maximum legibility of financial numbers and status codes.

---

## 3. Cross-Module Consistency Grammar

Every transactional module in AbrenERP implements the same Progressive Disclosure grammar. This guarantees a **repeatable, learnable interaction pattern** across the entire system:

| Module                    | Inquiry Screen (PL) | Data Entry Screen | Side Panel                                   |
| :------------------------ | :------------------ | :---------------- | :------------------------------------------- |
| **Journal Entries**       | `GL3010PL`          | `GL301000`        | Audit, FX rates, source documents            |
| **Vendor Bills**          | `AP3020PL`          | `AP302000`        | Linked invoices, approvals, GL impact        |
| **Bank Transactions**     | `BK3010PL`          | `BK301000`        | Reconciliation matches, import source        |
| **Inventory Adjustments** | `IN3010PL`          | `IN301000`        | Warehouse logs, count sheets                 |
| **Payment Requests**      | `AP3010PL` ✅       | `AP301000` ✅     | Workflow history, vendor info, budget impact |

> **Rule**: If a new module cannot express its primary workflow through `Workspace View → Inquiry Screen → Data Entry Screen → Side Panel`, the module's UX design must be escalated for architectural review before implementation.

---

## 4. Event → Financial Impact Engine (CRITICAL)

Users should rarely interact with debits and credits directly unless they are in the Ledger module.

- Every **Operational Work Unit Event** produces a deterministic accounting impact.
- **Example**:
  - _Event_: Payment Request Approved & Paid
  - _Projection_: `→ Debit: Accounts Payable` | `→ Credit: Cash (Bank)`
- **UX Implication**: Non-financial users never see the debits and credits. Financial users can trace them instantly via the **Contextual Provenance Drawer**. Every financial number must be traceable to its origin within **2 clicks**.

---

## 5. State Machine & Workflow Contract (Mandatory)

We will not rely on descriptive or ad-hoc statuses. Our Frontend UX will strictly enforce the backend state machines.

Every Work Unit explicitly implements its contract in the UI:

```text
Object: Payment Request

States:
- DRAFT
- PENDING_APPROVAL
- APPROVED
- PAID
- REJECTED

Transitions:
- Submit → DRAFT → PENDING_APPROVAL
- Approve → PENDING_APPROVAL → APPROVED

Guards (Enforced visually in the UI):
- Cannot "Approve" if the user lacks the specific workflow authority.
- Cannot "Pay" if target Bank Account is missing or balance is insufficient.
```

_Sensory Guidance_: When a state transitions, subtle motion guides the user's eye to the updated badge. Disabled actions must communicate _why_ they are locked based on the guards.

---

## 6. Action Surface Hierarchy (MANDATORY)

To prevent button clutter and decision paralysis, actions are strictly tiered:

1. **Primary Actions (State-Advancing)**: The **Expected Next Action** — a highlighted button on the toolbar, determined by the current record's domain status. Always visible and prominent (e.g., "Submit" when DRAFT, "Approve" when SUBMITTED). Rendered automatically by `FormToolbar` from `commands.ts`.
2. **Secondary Actions (Supporting)**: Other available commands on the toolbar. May appear directly on the toolbar (favorites) or in the **More Menu** under categorized sections.
3. **Tertiary Actions (Rare / Destructive)**: In the More Menu only, greyed out when unavailable. Require `ActionModal` confirmation (e.g., "Void", "Reject", "Delete").
4. **Bulk Actions (Multi-Selection Context)**: A floating action bar anchored to the bottom of the grid in inquiry screens. Appears via `<Transition>` when `selectedCount > 0`. Contains only state-advancing and utility actions applicable to the entire selection.

> **Rule:** No module may expose a destructive bulk action (e.g., bulk delete) without a preceding `ActionModal` confirmation that lists the affected record count.

---

## 7. Behavior Projection & Metadata Rendering Engine

Our metadata schema does not define or invent business logic. It **projects backend-defined state, constraints, and capabilities into consistent UI rendering, interaction patterns, and guidance.**

The schema dictates:

- **Rendering**: Currency fields automatically right-aligned with `tabular-nums`.
- **Behavior Projection**: Blocking progression if backend-defined verification rules fail.
- **Guidance**: Complex domains (like Tax Rules) use Wizard-style flows rather than single monolithic forms.

---

## 8. Audit & Trace as a First-Class UX Surface (CRITICAL)

Traceability is not an afterthought; it lives natively in the UI via Progressive Disclosure.

- Every Work Unit exposes its **Timeline**, **State Transitions**, and **Financial Impact**.
- **UI Pattern**: The standard Side Panel (`AppSidePane`) with icon strip tabs houses:
  - `Audit` (Timeline of state transitions and who approved what)
  - `Files` (Attached invoices, receipts)
  - `Financial Impact` (Projected or realized debits/credits)
  - `Trace` (Lineage to parent/child documents)
- **Rule**: _No number exists without a visible origin._

---

## 9. ERP UX Principles Summary

| Principle                   | Implementation                                                                                                                                     |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Isolation of State**      | No accidental mutations from queue clicks. Route transitions are explicit.                                                                         |
| **Progressive Disclosure**  | Heavy audit data only when requested via Side Panel icon tabs.                                                                                     |
| **ERP Density**             | Information richness staged per the Density Management Rules, never diluted.                                                                       |
| **Cultural Fit**            | Linear flows mirror Ethiopian SME accountants' step-by-step processing.                                                                            |
| **Scalability**             | Repeatable `Workspace View → Data Entry → Side Panel` grammar scales across every module.                                                          |
| **Training & Localization** | Sequential flows simplify translation and onboarding. Each step can carry localized tooltips or Amharic guidance without cluttering the interface. |

---

## 10. Vue Component Naming Convention

Every transactional UI feature expresses itself through these standardized component types:

| Component Type     | Naming Pattern          | Foundation   | Role                                                      |
| :----------------- | :---------------------- | :----------- | :-------------------------------------------------------- |
| **Inquiry Screen** | `{ScreenID}PL/view.vue` | Working Area | Full-screen DataGrid with filters (e.g., `AP3010PL`)      |
| **Data Entry**     | `{ScreenID}/view.vue`   | Working Area | 6-part form anatomy (e.g., `AP301000`)                    |
| **Side Panel Tab** | `sidepanels/{tab}.vue`  | Working Area | Icon strip tab content (audit, files, trace)              |
| **Dialog**         | `{Entity}Dialog.vue`    | Working Area | Interruptive confirmation for destructive operations      |
| **Field Renderer** | `AppField.vue`          | Working Area | **Tier 1** — Semantic data renderer (see Field System)    |
| **Layout Engine**  | `AppFieldset.vue`       | Working Area | **Tier 1** — Grid layout authority (see Field System)     |
| **Primitive**      | `App[Type].vue`         | All          | **Tier 1** — (`AppButton`, `AppInput`, `AppSelect`, etc.) |

> [!IMPORTANT]
> **Vendor Shielding**: Business modules MUST NOT use raw vendor primitives (raw headless primitives or third-party UI tags). All interaction must occur through our established **Tier 1 Primitives** so Abren owns the interface contract.

> **Rule**: If a component does not fit one of these types, it must be justified architecturally before creation.

### Golden Reference Screens

To prevent layout drift, the following screens serve as the immutable reference templates:

1. **Data Entry:** `AP301000/view.vue` — Demonstrates `AppTemplate`, `AppTabs`, `DataGrid`, and controller authority.
2. **Inquiry:** `AP3010PL/view.vue` — Demonstrates full-width DataGrid with filters and bulk actions.
3. **Side Panel:** `AP301000/sidepanels/` — Demonstrates icon strip tabs with contextual record binding.
