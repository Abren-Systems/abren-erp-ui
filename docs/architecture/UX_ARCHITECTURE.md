# Abren ERP — The Composable Business Operating System (UX Architecture)

> **Status:** AUTHORITATIVE — This document dictates the UX and Interaction Philosophy for the Abren ERP frontend. It acts as the companion to the technical [Architecture Manifesto](./ARCHITECTURE.md).

Before implementing the frontend views for Horizon A modules, we are establishing our ultimate UX/UI philosophy. We are elevating Abren from a "nice-looking CRUD system" to a **Composable Business Operating System for SMEs**.

> **Global Principle**: "Operations are the source of truth. Accounting is the guaranteed consequence."

Our True North Star is a synthesis of best-in-class philosophies:

- **Structure**: Sequential Progressive Disclosure (Step-by-step Task Progression)
- **Interaction**: Microsoft Fluent Design (Clarity & Feedback)
- **Workflow**: Linear (State-driven UX clarity isolated by Routing)
- **Financial UX**: Stripe Dashboard (Traceability & Precision via Contextual Drawers)
- **Architecture**: Route-Driven Components + Ephemeral State Machinery

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

Instead, we use a **Router-Driven Progressive Disclosure** flow. Each stage is an isolated route or overlay — never a simultaneously competing pane.

### 2.1. State Transition Flow

```text
[Queue/ListPage] → [DetailPage/Focus Mode] → [TraceDrawer] → [ActionModal]
```

- **Queue (Inbox)**: Dense grid for scanning/filtering work units.
- **Detail (Desk)**: Single entity focus, wide tabular form.
- **Trace (Filing Cabinet)**: On-demand provenance overlay.
- **ActionModal**: Explicit confirmation for destructive actions.

### 2.2. Component Interaction Contract

```text
┌───────────────────────────┐
│ [Domain]ListPage.vue      │
│  - Filters, DataGrid      │
│  - Navigates to Detail    │
└─────────────┬─────────────┘
              │ router.push()
              ▼
┌───────────────────────────┐
│ [Domain]DetailPage.vue    │
│  - Entity form/grid       │
│  - Primary actions (Post) │
│  - Opens TraceDrawer      │
│  - Opens ActionModal      │
└───────┬─────────┬─────────┘
        │         │
        ▼         ▼
┌─────────────┐   ┌────────────────┐
│ TraceDrawer │   │ ActionModal    │
│  - Audit    │   │  Confirm void  │
│  - Source   │   │  Confirm delete│
│  - Attach.  │   │                │
└─────────────┘   └────────────────┘
```

### 2.3. The 3 Stages of Operational Focus

1. **The Active Queue (The Inbox)**: A clean, full-screen DataGrid filtering for exactly what needs attention (e.g., `Status: PENDING_APPROVAL`). Clicking a row performs a `router.push()` — no inline entity mutation from the queue.
2. **The Focus Canvas (The Desk)**: The screen transitions cleanly to the entity. The queue disappears. The user focuses purely on doing the work in a linear, step-by-step fashion. Primary state-advancing actions are prominent; destructive actions are hidden behind `ActionModal` confirmations.
3. **Contextual Provenance (The Filing Cabinet)**: "No number without an origin" — but it is lazy-loaded. Audit histories, underlying vendor bills, and financial impact projections sit behind a slide-out `TraceDrawer`, appearing only when the user invokes it. When they are done investigating, they close the drawer and return to the focused context.

### 2.4. Density Management Rules

Each stage has an explicit density contract:

| Stage | Density | Rationale |
| :--- | :--- | :--- |
| **Queue (ListPage)** | Maximum — compact rows, filters, infinite scroll | Users need to quickly scan and locate their next task |
| **Detail (DetailPage)** | Balanced — wide grids, collapsible sections, breathing room | Users need focus, clarity, and space to make decisions |
| **Trace (TraceDrawer)** | Dense provenance, but lazy-loaded | Heavy audit data must not compete for attention until requested |
| **ActionModal** | Minimal — interruptive clarity | Destructive actions demand singular, undistracted confirmation |

---

## 3. Cross-Module Consistency Grammar

Every transactional module in AbrenERP implements the same Progressive Disclosure grammar. This guarantees a **repeatable, learnable interaction pattern** across the entire system:

| Module | Queue → | Detail → | Trace |
| :--- | :--- | :--- | :--- |
| **Journal Entries** | `JournalEntriesListPage` | `JournalEntryDetailPage` | Audit, FX rates, source documents |
| **Vendor Bills** | `VendorBillsListPage` | `VendorBillDetailPage` | Linked invoices, approvals, GL impact |
| **Bank Transactions** | `BankTransactionsListPage` | `BankTransactionDetailPage` | Reconciliation matches, import source |
| **Inventory Adjustments** | `AdjustmentsListPage` | `AdjustmentDetailPage` | Warehouse logs, count sheets |
| **Payment Requests** | `PaymentRequestsListPage` | `PaymentRequestDetailPage` | Workflow history, vendor info, budget impact |

> **Rule**: If a new module cannot express its primary workflow through `Queue → Detail → Trace`, the module's UX design must be escalated for architectural review before implementation.

---

## 4. Event → Financial Impact Engine (CRITICAL)

Users should rarely interact with debits and credits directly unless they are in the Ledger module.

- Every **Operational Work Unit Event** produces a deterministic accounting impact.
- **Example**:
  - *Event*: Payment Request Approved & Paid
  - *Projection*: `→ Debit: Accounts Payable` | `→ Credit: Cash (Bank)`
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

_Sensory Guidance (Fluent)_: When a state transitions, a subtle motion guides the user's eye to the updated badge. Disabled actions visually feedback exactly _why_ they are locked based on the Guards.

---

## 6. Action Surface Hierarchy (MANDATORY)

To prevent button clutter and decision paralysis, actions are strictly tiered:

1. **Primary Actions (State-Advancing)**: Always visible and prominent (e.g., "Approve", "Pay", "Submit"). _Rule: Only actions that move the workflow forward can be primary._
2. **Secondary Actions (Supporting)**: Visible but visually subdued (e.g., "Edit", "Attach Document", "Print").
3. **Tertiary Actions (Rare / Destructive)**: Hidden in overflow menus (`...`) and require `ActionModal` confirmation (e.g., "Void", "Reject", "Delete").

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
- **Rule**: *No number exists without a visible origin.*

---

## 9. ERP UX Principles Summary

| Principle | Implementation |
| :--- | :--- |
| **Isolation of State** | No accidental mutations from queue clicks. Route transitions are explicit. |
| **Progressive Disclosure** | Heavy audit data only when requested via `TraceDrawer`. |
| **ERP Density** | Information richness staged per the Density Management Rules, never diluted. |
| **Cultural Fit** | Linear flows mirror Ethiopian SME accountants' step-by-step processing. |
| **Scalability** | Repeatable `Queue → Detail → Trace` grammar scales across every module. |
| **Training & Localization** | Sequential flows simplify translation and onboarding. Each step can carry localized tooltips or Amharic guidance without cluttering the interface. |

---

## 10. Vue Component Naming Convention

Every transactional UI feature expresses itself through these standardized component types:

| Component Type | Naming Pattern | Role in Progressive Disclosure |
| :--- | :--- | :--- |
| **Queue** | `[Domain]ListPage.vue` | Stage 1: Full-screen DataGrid |
| **Focus Canvas** | `[Domain]DetailPage.vue` | Stage 2: Isolated entity work |
| **Provenance** | `[Domain]TraceDrawer.vue` | Stage 3: Lazy-loaded audit overlay |
| **Macro-Create** | `[Domain]CreatePage.vue` | Full page for creating complex entities (grids, line items) |
| **Micro-Create** | `[Domain]CreateDrawer.vue` | Slide-out for simple taxonomies (e.g., tags, fiscal periods) |
| **Form** | `[Domain][Action]Form.vue` | Headless presentation layer for a form |
| **Confirmation** | `[Domain]ActionModal.vue` | Interruptive confirmation for destructive operations |

> **Rule**: If a component does not fit one of these types, it must be justified architecturally before creation.
