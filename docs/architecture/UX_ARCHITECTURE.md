# Abren ERP — The Composable Business Operating System (UX Architecture)

> **Status:** AUTHORITATIVE — This document dictates the UX and Interaction Philosophy for the Abren ERP frontend. It acts as the companion to the technical [Architecture Manifesto](./ARCHITECTURE.md).

Before implementing the frontend views for Horizon A modules, we are establishing our ultimate UX/UI philosophy. We are elevating Abren from a "nice-looking CRUD system" to a **Composable Business Operating System for SMEs**.

> **Global Principle**: "Operations are the source of truth. Accounting is the guaranteed consequence."

Our True North Star is a synthesis of best-in-class philosophies:

- **Structure**: SAP Fiori (Role & Object-based Operations)
- **Interaction**: Microsoft Fluent Design (Clarity & Feedback)
- **Workflow**: Linear (State-driven UX clarity)
- **Financial UX**: Stripe Dashboard (Traceability & Precision)
- **Architecture**: Metadata-driven UI + Behavior Engine

---

## 1. Priority-Driven Workspaces (Not Just Roles)

Roles are too rigid for SMEs where one person wears five hats. We will use **Role + Context + State-based UX**.

- **Dynamic Launchpad**: The workspace leads with what needs attention _right now_, driven by our Decentralized Gatekeeper and Workflow engines:
  - "5 Payment Requests Awaiting Approval"
  - "2 Inventory Adjustments Pending Count"
  - "3 Vendor Bills Unmatched"
- **The Rule**: Every action in the system must instantly answer: _What needs attention? What can I do now? What will happen if I do it?_

## 2. Information Density & The Multi-Pane Operational View

We are upgrading from simple Master-Detail layouts to true **Operational Split Views** for complex tasks, utilizing progressive disclosure.

Instead of `[List] → [Detail]`, we utilize:

```text
[List (Left)] → [Focused Entity (Middle)] → [Trace / Related Data (Right)]
```

_Example 1 (Procurement / Accounts Payable Execution)_:

- Left: Active Payment Requests Queue
- Middle: Selected Payment Request (Lines, Taxes, Approvals)
- Right: Attached Vendor Invoices, Workflow History, and estimated Ledger Impact

_Example 2 (Complex Import/Export Execution)_:

- Left: Active Shipments Queue (Filtering by Port/Status)
- Middle: Selected Shipment details (Nested Accordions for Containers, SKUs, LC Status)
- Right: Trace Panel (Bill of Lading, Customs Declarations, Duties & Taxes, Landed Cost Projections)

## 3. Event → Financial Impact Engine (CRITICAL)

Users should rarely interact with debits and credits directly.

- Every **Operational Work Unit Event** produces a deterministic accounting impact.
- **Example**:
  - _Event_: Payment Request Approved & Paid
  - _Projection_: `→ Debit: Accounts Payable` | `→ Credit: Cash (Bank)`
- **UX Implication**: Non-financial users never see the debits and credits, but financial users can trace them instantly. Every financial number must be traceable to the operational event that spawned it within **2 clicks**.

## 4. State Machine & Workflow Contract (Mandatory)

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

## 5. Behavior Projection & Metadata Rendering Engine

Our metadata schema does not define or invent business logic. It **projects backend-defined state, constraints, and capabilities into consistent UI rendering, interaction patterns, and guidance.**

The schema dictates:

- **Rendering**: Currency fields automatically right-aligned with `tabular-nums`.
- **Behavior Projection**: Blocking progression if backend-defined verification rules fail.
- **Guidance**: Complex domains (like Tax Rules) use Wizard-style flows rather than single monolithic forms.

## 6. Action Surface Hierarchy (MANDATORY)

To prevent button clutter and decision paralysis, actions are strictly tiered:

1. **Primary Actions (State-Advancing)**: Always visible and prominent (e.g., "Approve", "Pay", "Submit"). _Rule: Only actions that move the workflow forward can be primary._
2. **Secondary Actions (Supporting)**: Visible but visually subdued (e.g., "Edit", "Attach Document", "Print").
3. **Tertiary Actions (Rare / Destructive)**: Hidden in overflow menus (`...`) and require modal confirmation (e.g., "Void", "Reject", "Delete").

## 7. Audit & Trace as a First-Class UX Surface (CRITICAL)

Traceability is not an afterthought; it lives natively in the UI.

- Every Work Unit exposes its **Timeline**, **State Transitions**, and **Financial Impact**.
- **UI Pattern**: The Right Pane of the Operational Split View natively houses tabs for:
  - `Trace` (Lineage to parent/child documents)
  - `Documents` (Attached invoices, receipts)
  - `Financial Impact` (Projected or realized debits/credits)
  - `Workflow History` (Audit log of who approved what and when)
- **Rule**: _No number exists without a visible origin._
