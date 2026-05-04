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

## Documentation Map

Navigate by concern:

### Architecture

| Document                                                                         | Description                                                                          |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [Frontend Architecture](architecture/ARCHITECTURE.md)                            | **Authority Baseline** — Core patterns, module rules, and layer structure            |
| [Acumatica Alignment Strategy](architecture/ACUMATICA_ALIGNMENT_STRATEGY.md)     | **ERP UI Authority** — Governing strategy for the screen-runtime rewrite             |
| [Screen Runtime Architecture](architecture/SCREEN_RUNTIME_ARCHITECTURE.md)       | Registered screens, screen instances, renderer, commands, and runtime model          |
| [UX Architecture](architecture/UX_ARCHITECTURE.md)                               | **UX Authority** — shell, workspace, progressive disclosure, and interaction grammar |
| [Field System](FIELD_SYSTEM.md)                                                  | **Field Authority** — AppField, AppFieldset layout engine, registry                  |
| [Module Structure](architecture/MODULE_STRUCTURE.md)                             | Bounded context mapping, folder conventions, and boundary rules                      |
| [Module Restructure Plan](architecture/MODULE_RESTRUCTURE_PLAN.md)               | Screen-first module export and folder migration plan                                 |
| [State Management](architecture/STATE_MANAGEMENT.md)                             | Pinia store patterns, module-scoped state, and cross-module reactivity               |
| [API Integration](architecture/API_INTEGRATION.md)                               | HTTP client, Anti-Corruption Layer (Mappers), OpenAPI type generation                |
| [Form Architecture](architecture/FORM_ARCHITECTURE.md)                           | TanStack Form + Zod integration and form layout patterns                             |
| [Testing Strategy](architecture/TESTING_STRATEGY.md)                             | Frontend testing pyramid, coverage targets, and tooling                              |
| [UI Foundation Decision](architecture/UI_FOUNDATION_DECISION.md)                 | **ADR** — Evaluation of Primitive libraries and library selection                    |
| [Design System](architecture/DESIGN_SYSTEM.md)                                   | **Visual Specs** — Colors, spacing, typography, and UX principles                    |
| [ERP Design System Architecture](architecture/ERP_DESIGN_SYSTEM_ARCHITECTURE.md) | ERP component layers and target shared UI structure                                  |
| [Component Contracts](architecture/COMPONENT_CONTRACTS.md)                       | ID, label, placement, configuration, personalization, and test contracts             |
| [UI Components](architecture/UI_COMPONENTS.md)                                   | Component ownership rules and usage expectations                                     |
| [Migration Roadmap](architecture/MIGRATION_ROADMAP.md)                           | Phased rollout from route/page app to screen-runtime ERP UI                          |

### Development

| Document                                      | Description                                                    |
| --------------------------------------------- | -------------------------------------------------------------- |
| [Development Guide](DEVELOPMENT.md)           | Setup, coding standards, naming conventions, import rules      |
| [Repository Strategy](REPOSITORY_STRATEGY.md) | How the UI repo coexists with the API repo, type sync workflow |

### Cross-Reference to Backend

| Backend Document                                                                | Relevance to Frontend                             |
| ------------------------------------------------------------------------------- | ------------------------------------------------- |
| [Backend Architecture](architecture/ARCHITECTURE.md)                            | Domain model definitions, bounded context rules   |
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

---

_This is a living document. Update the index as new documentation is added._
