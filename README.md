# Abren ERP UI

> Frontend for the Abren ERP Financial Operating System.

## Tech Stack

| Layer                 | Technology                           |
| --------------------- | ------------------------------------ |
| Framework             | Vue 3 + TypeScript (Composition API) |
| Build                 | Vite                                 |
| UI System             | Custom Design System (`core/ui/`)    |
| Accessible Primitives | Radix Vue                            |
| DataGrid Engine       | TanStack Table + TanStack Virtual    |
| Server State          | TanStack Query                       |
| Form State            | TanStack Form + Zod                  |
| Client State          | Pinia                                |
| Styling               | Tailwind CSS v4                      |
| HTTP                  | Axios                                |
| Testing               | Vitest + Playwright                  |

## Quick Start

```bash
# Install dependencies
vp install

# Start dev server (proxies /api to localhost:8000)
vp dev

# Run unit tests
vp test

# Generate API types from backend
vp run generate-types
```

## Project Structure

```
src/
├── app/              # Application shell (router, layouts)
├── core/             # Shared Kernel (NO business logic)
│   ├── api/          # Axios client, typed helpers
│   ├── auth/         # Auth engine (JWT, tenant scoping)
│   ├── domain/       # Money VO, Currency, branded types
│   ├── ui/           # Custom Design System (standard components)
│   └── types/        # Cross-module types & registry
├── modules/          # Bounded Contexts (Monolith Modules)
│   ├── business/     # [Applications] High-value business domains
│   │   └── finance/
│   │       ├── ledger/
│   │       └── bank/
│   └── platform/     # [Engines] Infrastructure & Platform services
│       ├── core/     # Identity & Management
│       └── workflows/# State Machine & Approvals
└── assets/           # Tailwind v4 entry + @theme tokens
```

## Documentation

| Document              | Path                                                                             |
| --------------------- | -------------------------------------------------------------------------------- |
| Architecture          | [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)           |
| Module Structure      | [docs/architecture/MODULE_STRUCTURE.md](docs/architecture/MODULE_STRUCTURE.md)   |
| State Management      | [docs/architecture/STATE_MANAGEMENT.md](docs/architecture/STATE_MANAGEMENT.md)   |
| API Integration       | [docs/architecture/API_INTEGRATION.md](docs/architecture/API_INTEGRATION.md)     |
| Form Architecture     | [docs/architecture/FORM_ARCHITECTURE.md](docs/architecture/FORM_ARCHITECTURE.md) |
| Error Handling        | [docs/architecture/ERROR_HANDLING.md](docs/architecture/ERROR_HANDLING.md)       |
| Testing Strategy      | [docs/architecture/TESTING_STRATEGY.md](docs/architecture/TESTING_STRATEGY.md)   |
| Repository Strategy   | [docs/REPOSITORY_STRATEGY.md](docs/REPOSITORY_STRATEGY.md)                       |
| Development Guide     | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)                                       |
| Implementation Status | [docs/IMPLEMENTATION_ROADMAP.md](docs/IMPLEMENTATION_ROADMAP.md)                 |
