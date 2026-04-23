---
title: 'Development Guide'
description: 'feature/{module}/{description}     e.g. feature/accounting/journal-entry-form'
tier: frontend
tags: [frontend]
---

# Development Guide

> **Parent:** [Documentation Overview](OVERVIEW.md)

---

## 1. Prerequisites

| **Environment** | **Vite+ (`vp`)** | Unified Build & Toolchain CLI |
| **Node.js** | 20 LTS+ | JavaScript runtime |
| **pnpm** | 10+ | Recommended package manager |
| **Git** | 2.40+ | Version control |
| **VS Code** | Latest | Recommended IDE |

### Recommended VS Code Extensions

- **Vue - Official** (`Vue.volar`) — Vue 3 + TypeScript support
- **ESLint** — Linting
- **Prettier** — Formatting
- **Tailwind CSS IntelliSense** — Styling support

---

## 2. Quick Start

```bash
# Clone (assumes abren-api already exists as sibling)
cd ~/python-projects/abren-erp
git clone <repo-url> abren-ui
cd abren-ui

# Install dependencies
vp install

# Generate API types (requires backend running on port 8000)
vp run generate-types

# Start dev server
vp dev
```

---

## 3. Available Scripts

| Command                 | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `vp dev`                | Start Vite dev server with HMR                   |
| `vp build`              | Production build                                 |
| `vp preview`            | Preview production build locally                 |
| `vp run generate-types` | Regenerate TypeScript types from backend OpenAPI |
| `vp run generate`       | Scaffold a strict 4-layer architectural module   |
| `vp lint`               | Run Oxlint                                       |
| `vp check`              | Run unified type-check, lint, and format         |
| `vp test`               | Run Vitest unit tests                            |
| `vp run test:e2e`       | Run Playwright E2E tests                         |

---

## 4. Git Workflow

### 4.1 Branch Naming

```
feature/{module}/{description}     e.g. feature/accounting/journal-entry-form
fix/{module}/{description}         e.g. fix/identity/login-redirect
docs/{description}                 e.g. docs/testing-strategy
refactor/{module}/{description}    e.g. refactor/core/http-client-interceptors
```

### 4.2 Commit Messages (Conventional Commits)

```
feat(accounting): add journal entry form with line grid
fix(identity): resolve login redirect after token expiry
docs(architecture): update state management patterns
refactor(core): extract idempotency key generator
test(payment-requests): add mapper unit tests
```

### 4.3 Main Branch Workflow

Before every merge to `main`:

1. `vp check` — Ensure type-check, lint, and format pass.
2. `vp test` — Ensure all unit and integration tests pass.
3. **Open OpenAPI Check**: Ensure `vp run generate-types` is run against the latest backend.

---

## 5. Environment Variables

All environment variables are prefixed with `VITE_` for Vite exposure:

| Variable            | Default                 | Description          |
| ------------------- | ----------------------- | -------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_APP_TITLE`    | `Abren ERP`             | Application title    |

---

## 6. Architectural Mastery

For detailed rules on how to build and structure the application, refer to the **Architecture Manifesto**:

- **[Architecture Manifesto](architecture/ARCHITECTURE.md)**: Core principles, Golden Rules, and "Symmetry Not Parity" philosophy.
- **[UX Architecture Manifesto](architecture/UX_ARCHITECTURE.md)**: The workboard-first, Abren-owned interaction model for operational finance.
- **[Module Structure](architecture/MODULE_STRUCTURE.md)**: The 4-Layer Taxonomy, Mapper-as-Factory, and scaffolding rules.
- **[API Integration](architecture/API_INTEGRATION.md)**: How to consume the backend's action-oriented endpoints.

---

> [!TIP]
> **Always run `vp check` before committing.** This ensures the codebase remains in a high-integrity state and complies with the authoritative manifesto.
