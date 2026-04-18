---
title: "Abren ERP UI — Implementation Roadmap"
description: "This roadmap governs the delivery of the Abren ERP frontend. In an architecture-first project, the UI is more than a set of features—it is the **primary validator** of the backend's hardened backbone."
tier: frontend
tags: [frontend]
---

# Abren ERP UI — Implementation Roadmap

> **Version:** 3.0
> **Last Updated:** April 2026
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
| **Application**    | **Query Key Factories** | Are query keys centralized to prevent silent cache drift?                        |
| **Application**    | **Strict API Typing**   | Does the composable use `useApiQuery`/`useApiMutation` with precise error types? |
| **UI**             | **Feedback Loops**      | Does the UI show global success/error toasts (`vue-sonner`) and loading states?  |

### 2.2 Operational Proof Gates

Before a Horizon is called "Consolidated," every backend capability must be proven end-to-end:

1. **Idempotency**: UI generates UUID7 keys for every mutation.
2. **Temporal Determinism**: UI passes explicit `now` context where required.
3. **Observability**: UI propagates `X-Request-ID` (handled by shared HTTP client).
4. **Audit**: UI actions are correctly attributed to the `CurrentUser`.

---

## 3. Ordered Transition Horizons

| Horizon                                      | Aim                                | Primary Frontend Goal                                        |
| -------------------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| **Horizon A — Backbone Consolidation**       | Operational Proof of the Core      | 100% Functional CRUD for Core, Ledger, and AP (PR/VB)        |
| **Horizon B — Domain Expansion**             | Support Operational Business Flows | Procurement, Sales, HR, and Fixed Assets UI                  |
| **Horizon C — Intelligence & Consolidation** | Multi-entity and Analytical Depth  | Group Reporting, IAS 21 Translation UI, Cashflow Projections |
| **Horizon D — Production Operating Posture** | Scalability & Resilience           | Advanced Session Management, Error Boundaries, PWA support   |

---

## 4. Current Status: Horizon A (Backbone Consolidation)

### 4.1 Core Operating System (Backend Stage 1)

| Capability                  | Status | Notes                                      |
| --------------------------- | ------ | ------------------------------------------ |
| Identity (Users/Roles List) | ✅     | Verified against live API                  |
| Tenant Context              | ✅     | Hydration working on reload                |
| Dashboard Stat Cards        | 🔨     | Currently hardcoded; needs API integration |
| User Profile Management     | 📋     | Planned for Phase 2                        |

### 4.2 Financial Engine (Backend Stage 2)

| Subdomain           | Status | Notes                                            |
| ------------------- | ------ | ------------------------------------------------ |
| **Ledger**          | 🔨     | CoA list ✅; Account Create/Edit 📋; Settings ✅ |
| **Fiscal Periods**  | 📋     | List ✅; Create/Open action 📋                   |
| **Journal Entries** | 🔨     | List ✅; Balanced Create Form 📋; Post action 📋 |
| **AP (Requests)**   | ✅     | Full Lifecycle: Create → Submit → Approve        |
| **AP (Bills)**      | 🔨     | List ✅; Validation/Rejection action 📋          |
| **Bank**            | 🔨     | List ✅; Transaction history ✅                  |

---

## 5. Sequencing Rule: "No Breadth on Unstable Seams"

The UI will not add new modules (e.g., Procurement) until the supporting seams (Ledger, Workflows, Identity) are **Consolidated** and **Verified**.

### Exit Criteria for Horizon A:

1. **Zero hardcoded strings** in the primary business flow.
2. **100% DTO sync** with the runtime OpenAPI spec.
3. **Global feedback system** (Toasts) active for all mutations.
4. **Dashboard** accurately reflects system state.

---

## 6. Cleanup & Technical Debt

| Task                              | Priority | Status               |
| --------------------------------- | -------- | -------------------- |
| Regenerate types from live API    | **P0**   | High drift detected  |
| Consolidate Branded Types         | ✅       | Done                 |
| Install `vue-sonner`              | **P1**   | Replaces basic Toast |
| Replace inline styles in CoA grid | **P1**   | Blueprint Violation  |
