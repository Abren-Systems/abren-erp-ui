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
> **Companions:** [Architecture Manifesto](./ARCHITECTURE.md) · [Field System](../FIELD_SYSTEM.md) · [Design System](./DESIGN_SYSTEM.md) · `ACUMATICA_ALIGNMENT_STRATEGY.md` · `SCREEN_RUNTIME_ARCHITECTURE.md`

> **Global Principle**: "Operations are the source of truth. Accounting is the guaranteed consequence."

Our True North Star is a synthesis of proven enterprise patterns (Acumatica, SAP Fiori, Dynamics 365), filtered through an Abren-owned product language:

- **Structure**: Sequential Progressive Disclosure (Step-by-step Task Progression)
- **Interaction**: **Headless accessibility + Abren-owned primitives** (behavior from infrastructure, product identity from Abren)
- **Aesthetic**: **Calm operational density** (serious, modern, trustworthy, low-theater)
- **Workflow**: Linear (State-driven UX clarity isolated by Routing)
- **Financial UX**: Traceability via Contextual Side Panels
- **Architecture**: **Screen Runtime** + **ERP Design System** + **Field System**

---

## 0. The Four Foundations (App Shell)

Every screen in Abren ERP exists within a rigid macro-architecture. These four structural foundations are immutable — they persist across all navigations and ensure users always know where they are.

```text
┌──────────────────────────────────────────────────────────────────┐
│                     TOP PANE (Global Bar)                       │
│  Search (⌘K) · Tenant Context · Notifications · User Session   │
├──────────┬─────────────────────────────────────────────────────┤
│          │                                                     │
│ SIDEBAR  │              WORKING AREA                           │
│ (Nav)    │  ┌───────────────────────────────────────────────┐  │
│          │  │ Form Title Bar (Record ID, Status, Actions)   │  │
│ Start    │  ├───────────────────────────────────────────────┤  │
│ Business │  │ Form Toolbar (Save, Cancel, Submit)           │  │
│ Platform │  ├───────────────────────────────────────────────┤  │
│          │  │ Summary Area (AppFieldset ghost/horizontal)   │  │
│          │  ├───────────────────────────────────────────────┤  │
│          │  │ Tabs & Details (AppTabs + DataGrid)           │  │
│          │  └───────────────────────────────────────────────┘  │
│          │                                                     │
└──────────┴─────────────────────────────────────────────────────┘
```

### 0.1 Top Pane

**Component:** `AuthenticatedLayout` header section (`sticky top-0 z-20`).
**Contents:** Global search (⌘K), Tenant/Company context, Notifications, User session.
**Constraint:** Must never contain module-specific actions or state.

### 0.2 Sidebar (Navigation)

**Component:** `AuthenticatedLayout` aside section.
**Structure:** Three strict categories: Start (Workboard), Business Domains, Platform.
**Constraint:** Driven by workspace configuration, registered screens, and RBAC permissions. Collapsible to icon-only mode.

### 0.3 Workspace

**Purpose:** The entry point into a Business Domain. Provides module-level health metrics, queue/list views, filters, saved views, and sanctioned bulk commands.
**Components:** `ScreenTitleBar`, `DataGrid`, smart tabs, filter surfaces, bulk action bar.
**Constraint:** Workspaces optimize for scanning and triage. Full record editing transitions to a dedicated Working Area screen instance.

### 0.4 Working Area

**Purpose:** The dedicated canvas for performing actual work on a single entity.
**Components:** The screen runtime payload rendered through a `ScreenRenderer` (during migration this may still resolve to an SFC such as `PaymentRequestFocus.vue`).
**Internal Anatomy:**

- **Form Title Bar** — `ScreenTitleBar` with Record ID, Status Badge, global record context, and record services.
- **Summary Area** — `AppFieldset variant="ghost" layout="horizontal"` for high-level record data.
- **Details Area** — `AppTabs` containing `DataGrid`, `AppFieldset` sections, or audit history.
- **Side Panel** — `AppSidePane` for contextual provenance (Trace Drawers).
  **Constraint:** The Working Area is the **exclusive domain of the Field System** (`AppField`, `AppFieldset`, `FieldGroup`). No raw HTML layouts. See [Field System Architecture](../FIELD_SYSTEM.md).

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
[Workspace Screen] → [Data Entry Screen] → [Side Panel / TraceDrawer] → [Action Dialog]
```

- **Workspace (Inbox)**: Dense grid for scanning/filtering work units.
- **Focus (Desk)**: Single entity focus, wide tabular form governed by the Field System.
- **Side Panel (Filing Cabinet)**: On-demand provenance overlay (Trace Drawers).
- **ActionModal**: Explicit confirmation for destructive actions.

### 2.2. Component Interaction Contract

The primary flow for transactional operations:

```text
┌────────────────────────────────────────────────────────┐
│ [Domain]ListPage.vue  (WORKSPACE)                      │
│  - Smart Filter Bucket Tabs + DataGrid                 │
│  - DataGrid footer: row count, total, selection count  │
│  - Bulk Action bar (appears when selectedCount > 0)    │
│  - Quick Triage: docked AppSidePane (mode="docked")    │
│      Shows audit timeline for selected row             │
│      Does NOT mutate; navigates to Focus for editing   │
└─────────────────────────┬──────────────────────────────┘
                          │ open/focus screen instance
                          ▼
┌───────────────────────────┐
│ [Domain]Focus.vue         │
│  (WORKING AREA)           │
│  - AppFieldset summary    │
│  - AppTabs + DataGrid     │
│  - Primary actions        │
│  - Opens Side Panel       │
│  - Opens ActionModal      │
└───────┬─────────┬─────────┘
        │         │
        ▼         ▼
┌─────────────┐   ┌────────────────┐
│ Side Panel  │   │ ActionModal    │
│ TraceDrawer │   │  Confirm void  │
│  - Audit    │   │  Confirm delete│
│  - Source   │   │                │
└─────────────┘   └────────────────┘
```

> **Rule:** The Quick Triage docked pane is read-only. It shows the audit trail for context. Any mutation (approve, edit, reject) must move the user into the Focus/data-entry screen. This preserves the state isolation guarantee of Sequential Progressive Disclosure.

### 2.3. The 3 Stages of Operational Focus

1. **The Workspace (The Inbox)**: A clean, full-screen DataGrid filtering for exactly what needs attention (e.g., `Status: PENDING_APPROVAL`). Clicking a row opens or focuses a registered screen instance. No inline entity mutation from the workspace beyond sanctioned bulk commands.
2. **The Focus Canvas (The Desk)**: The screen transitions cleanly to the entity. The workspace disappears. The user focuses purely on doing the work. The Working Area renders using the Field System (`AppFieldset`, `AppField`, `AppTabs`). Primary state-advancing actions are prominent; destructive actions require `ActionModal` confirmation.
3. **The Side Panel (The Filing Cabinet)**: "No number without an origin" — but it is lazy-loaded. Audit histories, underlying vendor bills, and financial impact projections sit behind a slide-out Side Panel (`TraceDrawer`), appearing only when the user invokes it. When they are done investigating, they close the panel and return to the focused context.

### 2.4. Density Management Rules

Each stage has an explicit density contract:

| Stage              | Density                                   | Rationale                                                      |
| :----------------- | :---------------------------------------- | :------------------------------------------------------------- |
| **Queue (List)**   | Maximum — compact rows, minimal chrome    | Scanning speed is paramount                                    |
| **Detail (Focus)** | Moderate — readable forms, clear sections | Accuracy over speed                                            |
| **Trace (Drawer)** | Compact — dense timeline, minimal padding | Supporting context, not primary work                           |
| **ActionModal**    | Minimal — interruptive clarity            | Destructive actions demand singular, undistracted confirmation |

### 2.5. Layered Context & Tiered Contrast (Dynamics 365 Standard)

We utilize a three-tier contrast system to create structural depth without heavy shadows or borders:

1.  **Level 0: The Canvas (`#faf9f8`)**: The "desk" — a neutral, pale gray background for the entire application.
2.  **Level 1: The Nav Anchor (`#f3f2f1`)**: The sidebar — a slightly deeper gray that houses stable navigational elements.
3.  **Level 2: The Action Surface (`#ffffff`)**: The "paper" — stark white containers (Grids, Forms, Detail cards) that float atop the canvas to signify interactive focus.

> **Principle**: High-density ERP data must always live on a **Level 2 (White)** surface to ensure maximum legibility of financial numbers and status codes.

---

## 3. Cross-Module Consistency Grammar

Every transactional module in AbrenERP implements the same Progressive Disclosure grammar. This guarantees a **repeatable, learnable interaction pattern** across the entire system:

| Module                    | Workspace →                | Focus →                  | Side Panel                                   |
| :------------------------ | :------------------------- | :----------------------- | :------------------------------------------- |
| **Journal Entries**       | `JournalEntriesListPage`   | `JournalEntryFocus`      | Audit, FX rates, source documents            |
| **Vendor Bills**          | `VendorBillsListPage`      | `VendorBillFocus`        | Linked invoices, approvals, GL impact        |
| **Bank Transactions**     | `BankTransactionsListPage` | `BankTransactionFocus`   | Reconciliation matches, import source        |
| **Inventory Adjustments** | `AdjustmentsListPage`      | `AdjustmentFocus`        | Warehouse logs, count sheets                 |
| **Payment Requests**      | `PaymentRequestsListPage`  | `PaymentRequestFocus` ✅ | Workflow history, vendor info, budget impact |

> **Rule**: If a new module cannot express its primary workflow through `Workspace → Focus → Side Panel`, the module's UX design must be escalated for architectural review before implementation.

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

1. **Primary Actions (State-Advancing)**: Always visible and prominent (e.g., "Approve", "Pay", "Submit"). _Mapping: `<AppButton variant="primary" />`._
2. **Secondary Actions (Supporting)**: Visible but visually subdued (e.g., "Edit", "Attach Document", "Print"). _Mapping: `<AppButton variant="secondary" />` or `variant="outline"`._
3. **Tertiary Actions (Rare / Destructive)**: Hidden in the `MoreMenu` and require `ActionModal` confirmation (e.g., "Void", "Reject", "Delete"). They remain visible in workflow-aware surfaces when useful for comprehension, but are not promoted as primary actions.
4. **Bulk Actions (Multi-Selection Context)**: A floating action bar anchored to the bottom of the grid surface. Appears via `<Transition>` when `selectedCount > 0`. Dismissed when selection is cleared. Contains only state-advancing and utility actions applicable to the entire selection. Never a modal — the bar must remain visible alongside the selected rows.

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
- **UI Pattern**: A standard `<TraceDrawer />` component accessible from the Focus Canvas houses:
  - `Trace` (Lineage to parent/child documents)
  - `Documents` (Attached invoices, receipts)
  - `Financial Impact` (Projected or realized debits/credits)
  - `Workflow History` (Audit log of who approved what and when)
- **Rule**: _No number exists without a visible origin._

---

## 9. ERP UX Principles Summary

| Principle                   | Implementation                                                                                                                                     |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Isolation of State**      | No accidental mutations from queue clicks. Route transitions are explicit.                                                                         |
| **Progressive Disclosure**  | Heavy audit data only when requested via `TraceDrawer`.                                                                                            |
| **ERP Density**             | Information richness staged per the Density Management Rules, never diluted.                                                                       |
| **Cultural Fit**            | Linear flows mirror Ethiopian SME accountants' step-by-step processing.                                                                            |
| **Scalability**             | Repeatable `Workspace → Focus → Side Panel` grammar scales across every module.                                                                    |
| **Training & Localization** | Sequential flows simplify translation and onboarding. Each step can carry localized tooltips or Amharic guidance without cluttering the interface. |

---

## 10. Vue Component Naming Convention

Every transactional UI feature expresses itself through these standardized component types:

| Component Type     | Naming Pattern             | Foundation   | Role                                                      |
| :----------------- | :------------------------- | :----------- | :-------------------------------------------------------- |
| **Workspace**      | `[Domain]ListPage.vue`     | Workspace    | Full-screen DataGrid with Smart Tabs                      |
| **Focus Canvas**   | `[Domain]Focus.vue`        | Working Area | Isolated entity work (Field System governs layout)        |
| **Side Panel**     | `[Domain]TraceDrawer.vue`  | Working Area | Lazy-loaded audit/provenance overlay                      |
| **Macro-Create**   | `[Domain]CreatePage.vue`   | Working Area | Full page for creating complex entities                   |
| **Micro-Create**   | `[Domain]CreateDrawer.vue` | Working Area | Slide-out for simple taxonomies                           |
| **Form**           | `[Domain][Action]Form.vue` | Working Area | Headless presentation layer for a form                    |
| **Confirmation**   | `[Domain]ActionModal.vue`  | Working Area | Interruptive confirmation for destructive operations      |
| **Field Renderer** | `AppField.vue`             | Working Area | **Tier 1** — Semantic data renderer (see Field System)    |
| **Layout Engine**  | `AppFieldset.vue`          | Working Area | **Tier 1** — Grid layout authority (see Field System)     |
| **Primitive**      | `App[Type].vue`            | All          | **Tier 1** — (`AppButton`, `AppInput`, `AppSelect`, etc.) |

> [!IMPORTANT]
> **Vendor Shielding**: Business modules MUST NOT use raw vendor primitives (raw headless primitives or third-party UI tags). All interaction must occur through our established **Tier 1 Primitives** so Abren owns the interface contract.

> **Rule**: If a component does not fit one of these types, it must be justified architecturally before creation.

### Golden Reference Screens

To prevent layout drift, the following screens serve as the immutable reference templates:

1. **Focus Canvas:** `PaymentRequestFocus.vue` — Demonstrates `layout="horizontal"`, `AppTabs`, and `DataGrid` isolation.
2. **Side Panel:** `PaymentRequestTraceDrawer.vue` — Demonstrates `layout="vertical"` and single-column density.
