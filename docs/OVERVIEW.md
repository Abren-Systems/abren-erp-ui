# Abren ERP UI — Documentation Overview

> **Version:** 1.0
> **Status:** Active Development
> **Last Updated:** March 2026
> **Backend Companion:** [abren-erp-api docs](../../abren-erp-api/docs/OVERVIEW.md)

---

## What Is Abren ERP UI?

Abren ERP UI is the **domain-aware frontend** for the Abren ERP Financial Operating System. It is not a thin CRUD skin — it is a structurally aligned, modular application that understands the same bounded contexts and business language as the backend, while using frontend-native idioms for implementation.

**Tech Stack:** Vue 3 + Vite + Pinia + TypeScript

---

## Documentation Map

Navigate by concern:

### Architecture
| Document | Description |
|----------|-------------|
| [Frontend Architecture](architecture/ARCHITECTURE.md) | **Authority** — Core patterns, module rules, and layer structure |
| [Module Structure](architecture/MODULE_STRUCTURE.md) | Bounded context mapping, folder conventions, and boundary rules |
| [State Management](architecture/STATE_MANAGEMENT.md) | Pinia store patterns, module-scoped state, and cross-module reactivity |
| [API Integration](architecture/API_INTEGRATION.md) | HTTP client, Anti-Corruption Layer (Mappers), OpenAPI type generation |
| [Testing Strategy](architecture/TESTING_STRATEGY.md) | Frontend testing pyramid, coverage targets, and tooling |
| [UI Foundation Decision](architecture/UI_FOUNDATION_DECISION.md) | **ADR** — Evaluation of Primitive libraries and library selection |
| [Design System](architecture/DESIGN_SYSTEM.md) | **Visual Specs** — Colors, spacing, typography, and UX principles |

### Development
| Document | Description |
|----------|-------------|
| [Development Guide](DEVELOPMENT.md) | Setup, coding standards, naming conventions, import rules |
| [Repository Strategy](REPOSITORY_STRATEGY.md) | How the UI repo coexists with the API repo, type sync workflow |

### Cross-Reference to Backend
| Backend Document | Relevance to Frontend |
|----------|-------------|
| [Backend Architecture](../../abren-erp-api/docs/architecture/ARCHITECTURE.md) | Domain model definitions, bounded context rules |
| [API Strategy](../../abren-erp-api/docs/architecture/API_STRATEGY.md) | Action-oriented endpoint patterns the UI consumes |
| [Tenant Features](../../abren-erp-api/docs/architecture/TENANT_FEATURES.md) | Feature gate rules mirrored in route guards |
| [Webhooks](../../abren-erp-api/docs/architecture/WEBHOOKS.md) | Webhook management UI requirements |

---

## Module Overview

The frontend mirrors the backend's bounded contexts as self-contained modules:

```
┌─────────────────────────────────────────────────────┐
│               PLATFORM ENGINES (Infra)              │
├──────────────────┬──────────────────┬───────────────┤
│  Core / ID       │  Workflows       │  Reporting    │
│  (platform/core) │ (platform/wf)    │ (platform/rep)│
└──────────────────┴──────────────────┴───────────────┘
                        │
          ┌─────────────┴─────────────┐
          │     BUSINESS APPS (Value) │
          ├──────────────────┬────────┴───────┐
          │      Finance     │      Sales     │
          │ (business/fin)   │ (business/sale)│
          └──────────────────┴────────────────┘
```

| Module | Namespace | Category | Description |
|--------|-----------|----------|-------------|
| `core` | `platform/core` | Engine | Tenants, Identity, RBAC |
| `workflows` | `platform/workflows` | Engine | Universal State Machine |
| `ledger` | `business/finance/ledger` | App | G/L Account Management |
| `bank` | `business/finance/bank` | App | Cash & Bank Integration |
| `ap` | `business/finance/ap` | App | Accounts Payable (Payment Requests) |
| `reporting` | `platform/reporting` | Engine | Cross-domain Dashboards |
| `webhooks` | `platform/webhooks` | Engine | System Integration Layer |

---

*This is a living document. Update the index as new documentation is added.*
