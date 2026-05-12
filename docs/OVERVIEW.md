---
title: 'Abren ERP UI — Documentation Overview'
description: 'Abren ERP UI is the **domain-aware frontend** for the Abren ERP Financial Operating System. It is not a thin CRUD skin — it is a structurally aligned, modular application that understands the same bou'
tier: frontend
tags: [frontend]
---

# Abren ERP UI — Documentation Overview

> **Version:** 1.1
> **Status:** Active Development
> **Last Updated:** May 2026
> **Backend Companion:** [abren-api docs](../../abren-api/docs/OVERVIEW.md)

---

## What Is Abren ERP UI?

Abren ERP UI is the **domain-aware frontend** for the Abren ERP Financial Operating System. It is not a thin CRUD skin — it is a structurally aligned, modular application that understands the same bounded contexts and business language as the backend, while using frontend-native idioms for implementation.

**Tech Stack:** Vue 3 + Vite + Pinia + TypeScript

---

## Documentation Map & Authority Hierarchy

The Abren ERP UI documentation follows a strict hierarchy. **ARCHITECTURE.md (v3.0)** is the single root of truth. All other documents are subordinate.

### Architecture Core

| Document                                                   | Description                                                                            | Authority           |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------- |
| [Frontend Architecture](architecture/ARCHITECTURE.md)      | **Single Root of Truth** — Core patterns, module rules, and layer structure.           | **Locked Baseline** |
| [Acumatica Alignment](architecture/ACUMATICA_ALIGNMENT.md) | **Mental Model Authority** — The exact mapping between Acumatica patterns and Abren.   | **Foundational**    |
| [Screen Runtime](architecture/SCREEN_RUNTIME.md)           | **Runtime Authority** — Screen IDs, Form Kinds, and state-machine driven Working Area. | Subordinate         |
| [Component System](architecture/COMPONENT_SYSTEM.md)       | **UI Authority** — Component ownership, contracts, and design system alignment.        | Subordinate         |
| [UX Architecture](architecture/UX_ARCHITECTURE.md)         | **UX Authority** — Progressive disclosure, interaction grammar, and shell foundations. | Subordinate         |
| [Field System](docs/architecture/FIELD_SYSTEM.md)          | **Field Authority** — AppField, AppFieldset layout engine, and registry.               | Subordinate         |

### Implementation Details

| Document                                                   | Description                                                           |
| ---------------------------------------------------------- | --------------------------------------------------------------------- |
| [State Management](architecture/STATE_MANAGEMENT.md)       | Pinia store patterns and reactive state flows.                        |
| [API Integration](architecture/API_INTEGRATION.md)         | HTTP client, Anti-Corruption Layer (Mappers), and OpenAPI generation. |
| [Form Architecture](architecture/FORM_ARCHITECTURE.md)     | TanStack Form + Zod integration and form layout patterns.             |
| [Identifier Strategy](architecture/IDENTIFIER_STRATEGY.md) | Mapping Human IDs to Backend UUIDs.                                   |
| [Error Handling](architecture/ERROR_HANDLING.md)           | Error categories, toast system, and loading states.                   |
| [Testing Strategy](architecture/TESTING_STRATEGY.md)       | Frontend testing pyramid and coverage targets.                        |
| [Design System](architecture/DESIGN_SYSTEM.md)             | **Visual Specs** — Colors, spacing, and typography tokens.            |
| [Naming Standard](architecture/NAMING.md)                  | **Authoritative** — Folders, files, components, and identifiers.      |
| [DataGrid Spec](design/DATA_GRID_SPEC.md)                  | Detailed specification for the core DataGrid platform component.      |

### Planning & Strategy

| Document                                                              | Description                                               |
| --------------------------------------------------------------------- | --------------------------------------------------------- |
| [Implementation Roadmap](IMPLEMENTATION_ROADMAP.md)                   | Horizon-based delivery plan and vertical integrity gates. |
| [Product Segmentation](architecture/PRODUCT_SEGMENTATION_STRATEGY.md) | GTM packaging tiers and module feature-gating strategy.   |

### Development

| Document                                      | Description                                                    |
| --------------------------------------------- | -------------------------------------------------------------- |
| [Development Guide](DEVELOPMENT.md)           | Setup, coding standards, naming conventions, import rules      |
| [Repository Strategy](REPOSITORY_STRATEGY.md) | How the UI repo coexists with the API repo, type sync workflow |

### Cross-Reference to Backend

| Backend Document                                                                | Relevance to Frontend                             |
| ------------------------------------------------------------------------------- | ------------------------------------------------- |
| [API Strategy](../../abren-api/docs/architecture/modules/API_STRATEGY.md)       | Action-oriented endpoint patterns the UI consumes |
| [Tenant Features](../../abren-api/docs/architecture/modules/TENANT_FEATURES.md) | Feature gate rules mirrored in route guards       |
| [Webhooks](../../abren-api/docs/architecture/infrastructure/WEBHOOKS.md)        | Webhook management UI requirements                |

---

## Module Overview

The frontend mirrors the backend's bounded contexts as self-contained modules:

```
┌─────────────────────────────────────────────────────┐
│               PLATFORM ENGINES (Shared)             │
├──────────────────┬──────────────────┬───────────────┤
│      Core        │    Workflows     │   Reporting   │
│     (core)       │   (workflows)    │  (reporting)  │
└──────────────────┴──────────────────┴───────────────┘
                        │
          ┌─────────────┴─────────────┐
          │     BUSINESS APPS (Domain)│
          ├──────────────────┬────────┴───────┐
          │      Finance     │      Bank      │
          │ (finance/ledger) │ (finance/bank) │
          └──────────────────┴────────────────┘
```

| Module      | Namespace        | Description                         | Status         |
| ----------- | ---------------- | ----------------------------------- | -------------- |
| `core`      | `core`           | Tenants, Identity, RBAC             | ✅ Implemented |
| `workflows` | `workflows`      | Universal State Machine             | ✅ Implemented |
| `ledger`    | `finance/ledger` | G/L Account Management              | ✅ Implemented |
| `bank`      | `finance/bank`   | Cash & Bank Integration             | 📋 Planned     |
| `ap`        | `finance/ap`     | Accounts Payable (Payment Requests) | ✅ Implemented |
| `reporting` | `reporting`      | Cross-domain Dashboards             | 📋 Planned     |
| `webhooks`  | `webhooks`       | System Integration Layer            | 📋 Planned     |

---

### **Standards Note: Permissions**

To ensure structural alignment across the full stack, all module permissions must strictly follow the `[namespace]:[action]` pattern (e.g., `ap:view`), where `namespace` matches the module's ID.

---

_This is a living document. Update the index as new documentation is added._
