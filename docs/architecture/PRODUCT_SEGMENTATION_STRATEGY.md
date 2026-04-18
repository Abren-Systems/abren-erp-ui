---
title: "Abren ERP - Product Segmentation & Architecture Strategy (v1.0)"
description: "To support scalable Go-To-Market (GTM) packaging and technical feature-gating, the ERP's modules fall into three rigid tiers:"
tier: frontend
tags: [frontend, architecture]
---

# Abren ERP: Product Segmentation & Architecture Strategy (v1.0)

## 1. Executive Vision: The Ledger-First Modular Monolith

- **The Paradigm:** Unlike legacy enterprise tools (e.g., Microsoft Dynamics 365) which rely on disjointed CRM and Finance databases synchronized via brittle "Dual Write" pipelines, Abren ERP operates as a **Ledger-First Modular Monolith**.
- **The Principle:** The database is unified, but module code boundaries are strictly enforced via Domain Events and Internal APIs. A Sales module order does not execute direct SQL against Ledger tables; rather, it emits a `SalesOrderConfirmed` event. This decouples the logic but guarantees a single, instant source of truth globally.

---

## 2. Module Boundaries & Feature Hierarchy

To support scalable Go-To-Market (GTM) packaging and technical feature-gating, the ERP's modules fall into three rigid tiers:

### 2.1 Tier 1: Core Foundation (The System Hub)

These modules are the non-negotiable central nervous system of any Abren ERP instance.

- **Identity & Access (IAM):** Multi-tenancy, User Roles, and explicit Row-Level Security via data scopes.
- **Financial Ledger (General Ledger):** The immutable double-entry accounting core.
- **Cash & Bank Management:** Reconciliations and liquidity pools.
- **Tax Engine:** Core compliance routines and statutory reporting logic.

### 2.2 Tier 2: Operational "Adjacent" Modules

These govern physical or operational tasks that eventually generate financial transactions. They are required for businesses running physical goods or complex procurement.

- **Procurement (Purchasing):** Vendor management, Purchase Orders, Requisitions.
- **Inventory & SCM:** Warehousing, Stock levels, Valuation. _(Required: Strict tenant isolation and row-level scoping)._
- **Accounts Payable / Accounts Receivable (AP/AR):** Invoice processing, aging reports, and collections.

### 2.3 Tier 3: Growth & Specialty Modules

These are advanced workflows built atop the Core and Operational tiers.

- **Human Resources (HR) & Payroll:** Employee lifecycle management and automated payroll burden journals.
- **Sales & Order Management:** Deal pipelines, CRM workflows, and Quotes.
- **Project Management:** Time-tracking and milestone-based billing.

---

## 3. Cross-Module Data Flow Protocols (Event-Driven)

_Spaghetti code is strictly prohibited._ Modules must never execute direct database writes against another module's schema. Integrations must use **Domain Events**.

### 3.1 Scenario: "Order to Cash" (Sales to Finance)

1.  **Sales Module:** Quotes marked "Won" → Generates Sales Order.
2.  **Event Generation:** Sales publishes internal context `SalesOrderConfirmed`.
3.  **SCM Module Listen:** SCM catches event → Allocates stock → Publishes `InventoryAllocated`.
4.  **AR Module Listen:** AR catches event → Drafts customer Invoice.
5.  **Ledger Update:** Upon Invoice approval, the AR module strictly calls `LedgerService.postJournalEntry()`.

### 3.2 Scenario: "Payroll Event" (HR to Finance)

1.  **HR Module:** Manager confirms monthly payroll run.
2.  **Event Generation:** HR publishes `PayrollRunApproved` containing aggregated tax/net-pay totals.
3.  **AP Module Listen:** AP automatically drafts payable liabilities for tax authorities and benefit providers.
4.  **Ledger Update:** The Ledger listener catches the event → Automatically posts the massive multi-line `Payroll Expense Journal` directly.

---

## 4. GTM Packaging & Feature Flagging

Module access is dynamically gated at runtime based on the tenant's subscription tier.

### 4.1 Packaging Tiers

| Package              | Target Segment           | Unlocked Modules                        | Value Proposition                      |
| :------------------- | :----------------------- | :-------------------------------------- | :------------------------------------- |
| **Abren Core**       | Service SMBs / Startups  | Ledger, Cash, Tax, basic AP/AR          | "Instantly close your books."          |
| **Abren Operations** | Wholesale / Distribution | Core + **Inventory & SCM, Procurement** | "Unified stock & purchasing."          |
| **Abren Enterprise** | Mid-market / Scale-ups   | Operations + **Sales, Projects**        | "End-to-end operational density."      |
| **Abren People**     | _Add-on to any tier_     | **HR & Payroll**                        | "Native payroll synced to the ledger." |

### 4.2 Technical "Gate" Implementation

- **Backend Middleware (`ISubscriptionGate`):** Unlicensed API routes (e.g., an `Abren Core` user executing a `POST /api/v1/inventory/item`) strictly return `402 Payment Required`.
- **Frontend Routing:** The client reads the `SubscriptionContext` upon login and trims the 220px Left-Hand Navigation Rail. If the tenant lacks the _Operations_ package, the entire "Procurement", "Inventory", and "Warehousing" UI paths simply do not exist in their DOM.
