---
title: 'Abren ERP UI — Implementation Roadmap'
description: "This roadmap governs the delivery of the Abren ERP frontend. In an architecture-first project, the UI is more than a set of features—it is the **primary validator** of the backend's hardened backbone."
tier: frontend
tags: [frontend]
---

# Abren ERP UI — Implementation Roadmap

> **Version:** 3.1
> **Last Updated:** May 2026
> **Status:** Authoritative
> **Guiding Principle:** Architecture is constant. Scope, depth, and operational proof evolve.
> **Companion:** [Architecture Blueprint](./architecture/ARCHITECTURE.md)
> **Companion Skill:** [Vue 3 Abren ERP Development](../.agents/skills/vue3-abren-erp/SKILL.md)

---

## 1. Why this roadmap exists

This roadmap governs the delivery of the Abren ERP frontend. In an architecture-first project, the UI is more than a set of features—it is the **primary validator** of the backend's hardened backbone.

Its job is to track:

- **Architectural Integrity (Vertical)**: Adherence to the 4-layer architecture, Mapper-as-Factory, and Zod-shielded adapters.
- **Functional Scope (Horizontal)**: The breadth of business modules usable by the end-user.
- **Operational Proof**: The verification that backend capabilities (idempotency, temporal determinism, audit) actually work in a real-world user flow.

---

## 2. The Implementation Model

### 2.1 Vertical Integrity vs. Horizontal Scope

A module is not "Done" just because it has a page. It must meet the **Vertical Integrity Gate**:

| Layer              | Requirement             | Status Check                                                                     |
| ------------------ | ----------------------- | -------------------------------------------------------------------------------- |
| **Infrastructure** | **Zod Shielding**       | Are DTOs parsed by Zod schemas to catch backend drift?                           |
| **Infrastructure** | **Mapper-as-Factory**   | Is the raw DTO transformed into a high-integrity Domain Entity?                  |
| **Application**    | **Query Key Factories** | Are query keys centralized in `application/query-keys.ts`?                       |
| **Application**    | **Strict API Typing**   | Does the composable use `useApiQuery`/`useApiMutation` with precise error types? |
| **UI**             | **Feedback Loops**      | Does the UI show global success/error toasts and loading states?                 |

### 2.2 Operational Proof Gates

Before a Horizon is called "Consolidated," every backend capability must be proven end-to-end:

1. **Idempotency**: UI generates UUID7 keys for every mutation.
2. **Temporal Determinism**: UI passes explicit `now` context where required.
3. **Observability**: UI propagates `X-Request-ID` (handled by shared HTTP client).
4. **Audit**: UI actions are correctly attributed to the `CurrentUser`.

---

## 3. Ordered Transition Horizons (Functional)

| Horizon                                      | Aim                                | Primary Frontend Goal                                        |
| -------------------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| **Horizon A — Backbone Consolidation**       | Operational Proof of the Core      | 100% Functional CRUD for Core, Ledger, and AP (PR/VB)        |
| **Horizon B — Domain Expansion**             | Support Operational Business Flows | Procurement, Sales, HR, and Fixed Assets UI                  |
| **Horizon C — Intelligence & Consolidation** | Multi-entity and Analytical Depth  | Group Reporting, IAS 21 Translation UI, Cashflow Projections |
| **Horizon D — Production Operating Posture** | Scalability & Resilience           | Advanced Session Management, Error Boundaries, PWA support   |

---

## 4. UI Structural Horizons (Architectural)

Parallel to functional delivery, the UI architecture evolves through its own structural phases. These ensure the frontend remains a robust metadata-driven runtime.

| Phase         | Focus                              | Status    | Key Deliverables                                                         |
| ------------- | ---------------------------------- | --------- | ------------------------------------------------------------------------ |
| **Phase 1**   | Primitives & Value Purity          | ✅ Done   | `AppField`, `AppFieldset`, Field Registry, no pre-formatting.            |
| **Phase 1.5** | Layout Engine & Grid Discipline    | ✅ Done   | `AppFieldset` drives CSS Grid, `140px` baseline, Golden Screens.         |
| **Phase 2.0** | Module Flattening & Screen Runtime | ✅ Done   | Flat `application/`, `ui/{ScreenID}/` pattern. AP module fully migrated. |
| **Phase 2.5** | Editable Forms & Zod Binding       | ✅ Done   | Input variants, Zod schema binding, `ScreenModel` field overrides.       |
| **Phase 3**   | Server-Driven Metadata             | 🚧 Active | `ScreenModel` runtime established; JSON-driven snapshotting active.      |

### The Golden Reference Screens

To prevent layout drift, the following screens serve as the **immutable reference templates** for all future development:

1. **The Screen-ID Focus Canvas:** `AP301000/view.vue` — Demonstrates the full Screen Runtime controller pattern with `AppTabs`, `DataGrid`, side panels, and command dispatch.
2. **The Screen-ID Workspace:** `AP3010PL/view.vue` — Demonstrates the primary list/workspace layout with bulk actions and filter panels.
3. **The Trace Side Panel:** `AP301000/sidepanels/trace.vue` — Demonstrates `AppSidePanel mode="docked"` with a vertical single-column layout.

> **Note:** Legacy modules (Ledger, Inventory) use the old `pages/components/` pattern under `ui/`. They must migrate to the `ui/{ScreenID}/` pattern when next touched.

---

## 5. Current Status: Horizon A (Backbone Consolidation)

### 5.1 Core Operating System

| Capability                  | Status | Notes                                        |
| --------------------------- | ------ | -------------------------------------------- |
| Identity — Users/Roles List | ✅     | `UsersPage.vue`, `RolesListPage.vue` live    |
| Tenant Context              | ✅     | Hydration working on reload                  |
| Workboard                   | ✅     | `WorkboardPage.vue` with stats, queue, trace |
| Dashboard Stat Cards        | 🔨     | Implemented but hardcoded; needs API data    |
| User Profile Management     | 📋     | Planned                                      |

### 5.2 Financial Engine — Ledger

| Capability                 | Status | Notes                                                        |
| -------------------------- | ------ | ------------------------------------------------------------ |
| Chart of Accounts — List   | ✅     | `ChartOfAccountsListPage.vue`                                |
| Chart of Accounts — Detail | ✅     | `ChartOfAccountsDetailPage.vue` + `CreateAccountDrawer.vue`  |
| Fiscal Periods — List      | ✅     | `FiscalPeriodsListPage.vue` + `FiscalPeriodCreateDrawer.vue` |
| Journal Entries — List     | ✅     | `JournalEntriesListPage.vue`                                 |
| Journal Entries — Create   | 🔨     | `JournalEntryCreateDrawer.vue` exists; Post action 📋        |
| Journal Entries — Detail   | ✅     | `JournalEntryDetailPage.vue` + `JournalEntryTraceDrawer.vue` |
| Ledger Settings            | ✅     | `LedgerSettingsPage.vue`                                     |

### 5.3 Financial Engine — AP

| Capability                      | Status | Notes                                                           |
| ------------------------------- | ------ | --------------------------------------------------------------- |
| Payment Requests — Workspace    | ✅     | `AP3010PL/view.vue` — Screen ID pattern                         |
| Payment Requests — Focus        | ✅     | `AP301000/view.vue` — Full lifecycle: Create → Submit → Approve |
| Payment Requests — Bulk Actions | ✅     | `AP3010PL/bulk-actions.vue`                                     |
| Vendor Bills — List             | ✅     | `VendorBillsListPage.vue`                                       |
| Vendor Bills — Focus            | ✅     | `VendorBillFocus.vue`                                           |
| Vendor Bills — Validate/Reject  | 🔨     | UI exists; full action wiring 📋                                |

### 5.4 Financial Engine — Tax

| Capability        | Status | Notes                                            |
| ----------------- | ------ | ------------------------------------------------ |
| Tax Groups — List | ✅     | `TaxGroupsListPage.vue` + `TaxGroupCreateDrawer` |
| Tax Rules — List  | ✅     | `TaxRulesListPage.vue` + `TaxRuleCreateDrawer`   |

### 5.5 Financial Engine — Bank

| Capability           | Status | Notes                      |
| -------------------- | ------ | -------------------------- |
| Bank Accounts — List | ✅     | `BankAccountsListPage.vue` |
| Transaction History  | 📋     | Not yet implemented        |

### 5.6 Inventory

| Capability          | Status | Notes                                                 |
| ------------------- | ------ | ----------------------------------------------------- |
| Stock Items — List  | ✅     | `StockItemsListPage.vue`                              |
| Warehouses — List   | ✅     | `WarehousesListPage.vue`                              |
| Adjustment — Create | ✅     | `AdjustmentCreatePage.vue`                            |
| ⚠ Legacy pattern    | 🔨     | Uses `pages/` structure; requires Screen ID migration |

### 5.7 Workflows

| Capability     | Status | Notes                                            |
| -------------- | ------ | ------------------------------------------------ |
| Workflow Inbox | ✅     | `WorkflowInboxPage.vue` + `WorkflowActionDialog` |

### 5.8 Reporting

| Capability         | Status | Notes                               |
| ------------------ | ------ | ----------------------------------- |
| Cashflow Dashboard | 🔨     | `CashflowDashboard.vue` stub exists |
| Reporting Chart    | 🔨     | `ReportingChart.vue` stub exists    |

---

## 6. Sequencing Rule: "No Breadth on Unstable Seams"

The UI will not add new modules (e.g., Procurement) until the supporting seams (Ledger, Workflows, Identity) are **Consolidated** and **Verified**.

### Exit Criteria for Horizon A

1. **Zero hardcoded strings** in the primary business flow.
2. **100% DTO sync** with the runtime OpenAPI spec.
3. **Global feedback system** (Toasts) active for all mutations.
4. **Dashboard** accurately reflects system state.

---

## 7. Cleanup & Technical Debt

| Task                                            | Priority | Status                                       |
| ----------------------------------------------- | -------- | -------------------------------------------- |
| Regenerate types from live API                  | **P0**   | Drift risk — `openapi-typescript` installed  |
| Install toast library (`vue-sonner` or equiv)   | **P1**   | Not installed; feedback loops incomplete     |
| Ledger — migrate to `ui/{ScreenID}/` pattern    | **P1**   | Currently uses legacy `pages/components/`    |
| Inventory — migrate to `ui/{ScreenID}/` pattern | **P1**   | Currently uses legacy `pages/` structure     |
| Replace inline styles in CoA grid               | **P2**   | Blueprint violation                          |
| Vendor Bills — complete action wiring           | **P2**   | Validate/Reject UI exists, mutations pending |
