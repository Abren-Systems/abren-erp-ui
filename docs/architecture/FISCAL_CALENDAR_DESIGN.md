---
title: 'Fiscal Calendar Domain Design'
description: 'Domain modeling for the Fiscal Year, Financial Periods, and Period Lifecycle subsystem — aligned with Acumatica canonical patterns.'
tier: frontend
tags: [frontend, architecture, domain-modeling, ledger, fiscal-calendar]
status: draft
---

# Fiscal Calendar Domain Design

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Acumatica Reference:** [Acumatica Alignment](ACUMATICA_ALIGNMENT.md) — §3 (Form Kinds), §4 (Screen ID System)
> **Status:** DRAFT — Domain model under review. No code changes until approved.
> **Last Updated:** May 2026

---

## 1. Why This Document Exists

Our current `GL102000` (Fiscal Periods) screen conflates three distinct Acumatica concerns into a single screen with a creation drawer. This is a **domain modeling error**, not merely a UI pattern violation.

Before any code touches the Fiscal Calendar screens, the domain model must be correct. This document establishes that model.

---

## 2. The Problem: Current State

### What We Have

```
GL102000 — "Fiscal Periods" (kind: 'maintenance')
├── view.vue (78 lines)
│   ├── PageHeader (non-canonical)
│   ├── DataGrid of periods
│   ├── Inline permission checks
│   └── FiscalPeriodCreateDrawer (3 fields: name, start_date, end_date)
├── controller.ts (hollow stub — no authority)
└── screen.ts (kind: 'maintenance' — incorrect for this concern)
```

### What's Wrong

| Issue                             | Why It's Wrong                                                                                                           |
| :-------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **One-at-a-time period creation** | Periods are children of a Fiscal Year. They should be **bulk-generated** from a year template, not created individually. |
| **No Fiscal Year entity**         | There is no parent entity. Periods float without a year context.                                                         |
| **No period lifecycle**           | Periods have states (Inactive → Open → Closed → Locked) but the current model treats them as static data.                |
| **Drawer as creation pattern**    | The Drawer (`AppSidePane`) is for contextual read-only details, not entity creation.                                     |
| **Screen ID conflict**            | `GL102000` in Acumatica = General Ledger Preferences. Our GL102000 = Fiscal Periods.                                     |

---

## 3. The Correct Domain Model: Acumatica Canonical

### 3.1 Entity Hierarchy

```
Fiscal Year (parent)
├── year: "FY2026"
├── startDate: 2026-01-01
├── periodType: 'monthly' | 'quarterly' | 'custom'
├── includeAdjustmentPeriod: boolean
└── periods: FiscalPeriod[] (children — auto-generated)
    ├── FiscalPeriod { name: "Jan 2026", start: 01-01, end: 01-31, status: OPEN }
    ├── FiscalPeriod { name: "Feb 2026", start: 02-01, end: 02-28, status: OPEN }
    ├── ...
    ├── FiscalPeriod { name: "Dec 2026", start: 12-01, end: 12-31, status: INACTIVE }
    └── FiscalPeriod { name: "Adj 2026", start: 12-31, end: 12-31, status: INACTIVE } (optional)
```

### 3.2 Period Lifecycle State Machine

```
                   Generate
                      │
                      ▼
                ┌──────────┐
                │ INACTIVE │ ← Newly generated, not yet usable
                └────┬─────┘
                     │ Open
                     ▼
                ┌──────────┐
                │   OPEN   │ ← Transactions can be posted
                └────┬─────┘
                     │ Close
                     ▼
                ┌──────────┐
                │  CLOSED  │ ← Period-end completed, reopenable
                └────┬─────┘
                     │ Lock
                     ▼
                ┌──────────┐
                │  LOCKED  │ ← Terminal — audit-sealed, no modifications
                └──────────┘
```

### 3.3 Key Constraints

1. **Subledger Closing Order**: AP, AR, and Inventory periods must be closed BEFORE the GL period can be closed.
2. **Sequential Opening**: Periods should generally be opened sequentially (can't open March before February).
3. **Adjustment Period**: Year-end adjustment entries go into a special 13th period (if configured).
4. **Multi-Year Coexistence**: FY2025 may be `CLOSED`, FY2026 `OPEN`, FY2027 `INACTIVE` — all simultaneously.

---

## 4. Acumatica Screen Decomposition

Acumatica splits the Fiscal Calendar concern across **four screens**, each with a distinct form kind:

| Screen                         | ID         | Kind        | Purpose                                                                                           | Key Actions          |
| :----------------------------- | :--------- | :---------- | :------------------------------------------------------------------------------------------------ | :------------------- |
| **Financial Year**             | `GL101000` | Setup       | Define the fiscal year _structure_ (start date, period type, adjustment period flag)              | Save                 |
| **Master Financial Calendar**  | `GL201000` | Maintenance | View the generated calendar. **Generate Calendar** action creates periods from the year template. | Generate Calendar    |
| **General Ledger Preferences** | `GL102000` | Setup       | GL-wide configuration (posting rules, role restrictions, account defaults)                        | Save                 |
| **Manage Financial Periods**   | `GL503000` | Processing  | Batch open/close/lock/unlock periods across subledgers                                            | Process, Process All |

### Why This Decomposition Matters

Each screen has a **fundamentally different authority model**:

| Concern           | Authority                         | Lifecycle                          |
| :---------------- | :-------------------------------- | :--------------------------------- |
| Year structure    | Admin-defined template            | Rarely changes after initial setup |
| Period generation | Bulk action on template           | Run once per fiscal year           |
| Period lifecycle  | Workflow-driven state transitions | Monthly/quarterly cadence          |
| GL preferences    | System-wide configuration         | Rarely changes                     |

Conflating these into one screen means conflating four different authority models, four different toolbar contracts, and four different lifecycle cadences. That's why it breaks.

---

## 5. Proposed Abren Screen Mapping

### Option A: Acumatica-Canonical (Strict Alignment)

| Abren Screen              | ID         | Kind        | Maps To            | Notes                                                               |
| :------------------------ | :--------- | :---------- | :----------------- | :------------------------------------------------------------------ |
| Financial Year Setup      | `GL101000` | Setup       | Acumatica GL101000 | Replaces current "Ledger Settings" (which moves to GL102000)        |
| GL Preferences            | `GL102000` | Setup       | Acumatica GL102000 | Current "Ledger Settings" content (account mappings, posting rules) |
| Master Financial Calendar | `GL202000` | Maintenance | Acumatica GL201000 | NEW. View periods, "Generate Calendar" toolbar action               |
| Financial Calendar List   | `GL2020PL` | Inquiry     | —                  | Optional PL pair for GL202000                                       |
| Manage Financial Periods  | `GL503000` | Processing  | Acumatica GL503000 | Future. Batch open/close/lock                                       |

> [!WARNING]
> **Breaking Change**: This would renumber GL101000 (Ledger Settings → GL102000) and repurpose GL102000 (Fiscal Periods → GL101000 Financial Year + GL202000 Calendar). Routes, screen registries, and navigation would all need updating.

### Option B: Pragmatic (Minimal ID Disruption)

Keep current Screen IDs but correct the domain model and form kinds:

| Abren Screen              | ID         | Kind        | Content Change                                                     |
| :------------------------ | :--------- | :---------- | :----------------------------------------------------------------- |
| Ledger Settings           | `GL101000` | Setup       | Keep as-is, normalize to canonical pattern                         |
| Financial Year & Calendar | `GL102000` | Maintenance | Redesign: header (year template) + detail grid (generated periods) |
| Manage Financial Periods  | `GL503000` | Processing  | Future                                                             |

> [!NOTE]
> Option B avoids the breaking Screen ID renumbering while still correcting the domain model. The `GL102000` screen becomes a proper master-detail maintenance form: Year header + Periods grid.

---

## 6. Domain Types (Proposed)

```typescript
// domain/fiscal-year.types.ts

type FiscalYearId = string & { readonly __brand: 'FiscalYearId' }
type FiscalPeriodId = string & { readonly __brand: 'FiscalPeriodId' }

type PeriodType = 'monthly' | 'quarterly' | 'custom'
type PeriodStatus = 'INACTIVE' | 'OPEN' | 'CLOSED' | 'LOCKED'

interface FiscalYear {
  readonly id: FiscalYearId
  readonly year: string // e.g., "FY2026"
  readonly startDate: string // ISO date
  readonly endDate: string // ISO date
  readonly periodType: PeriodType
  readonly includeAdjustmentPeriod: boolean
  readonly periodCount: number // 12, 13, 4, etc.
  readonly status: 'ACTIVE' | 'CLOSED'
  readonly periods: readonly FiscalPeriod[]
}

interface FiscalPeriod {
  readonly id: FiscalPeriodId
  readonly fiscalYearId: FiscalYearId
  readonly name: string // e.g., "Jan 2026"
  readonly periodNumber: number // 1-13
  readonly startDate: string
  readonly endDate: string
  readonly status: PeriodStatus
  readonly isAdjustment: boolean
}
```

---

## 7. Backend Dependency

> [!IMPORTANT]
> This domain redesign has **backend implications**. The backend must support:
>
> 1. A `FiscalYear` aggregate root (if not already present)
> 2. A "Generate Calendar" action that bulk-creates periods from a year template
> 3. Period lifecycle transitions (open/close/lock) as domain commands
> 4. Subledger closure validation (AP/AR must close before GL)
>
> The frontend domain modeling documented here should be coordinated with the backend team before implementation.

---

## 8. Decision Required

Before implementation, the following must be decided:

1. **Option A vs Option B** for Screen ID mapping (see §5)
2. **Backend readiness** — does the backend currently have a FiscalYear aggregate, or only flat FiscalPeriod records?
3. **Scope boundary** — should `GL503000` (Manage Financial Periods) be included in the initial redesign, or deferred as a separate milestone?

---

## 9. References

- [Acumatica Alignment §3 — Form Kinds](ACUMATICA_ALIGNMENT.md#3-form-kinds-what-appears-in-the-working-area)
- [Acumatica Alignment §4 — Screen ID System](ACUMATICA_ALIGNMENT.md#4-the-screen-id-system)
- [Form Architecture §2 — Authority Model](FORM_ARCHITECTURE.md#2-the-four-layers-of-authority-model)
- [Screen Migration Guide](SCREEN_MIGRATION.md) — canonical migration process
