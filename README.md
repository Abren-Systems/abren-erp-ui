# Abren ERP UI

Frontend for Abren ERP, a workflow-centered financial operations workspace for SMEs.

## Product Direction

Abren is not being designed as a generic admin dashboard. The frontend is evolving toward:

- a **workboard-first** home experience
- dense but calm operational workspaces
- route-driven focus for consequential tasks
- drawer-based traceability and supporting context
- truthful UI surfaces that avoid fake metrics and placeholder theater

The current UX reset proposal lives in [docs/architecture/UX_RESET_PROPOSAL.md](docs/architecture/UX_RESET_PROPOSAL.md).

## Tech Stack

| Layer        | Technology                                                  |
| ------------ | ----------------------------------------------------------- |
| Framework    | Vue 3 + TypeScript + Composition API                        |
| Build        | Vite                                                        |
| Routing      | Vue Router                                                  |
| Server State | TanStack Query                                              |
| Tables       | TanStack Table + TanStack Virtual                           |
| UI State     | Pinia for ephemeral client state only                       |
| Styling      | Tailwind CSS v4 + shared design tokens                      |
| Primitives   | Abren-owned shared components built on headless foundations |
| HTTP         | Axios                                                       |
| Testing      | Vitest + Playwright                                         |

## Quick Start

```bash
vp install
vp dev
vp check
vp test
```

## Project Structure

```text
src/
├── app/              # Router, layouts, application shell
├── assets/           # Global styles and tokens
├── modules/          # Bounded contexts and business/platform modules
├── shared/           # Shared kernel: primitives, utilities, auth, api, domain helpers
└── main.ts           # App bootstrap
```

Each module follows the 4-layer structure:

```text
modules/{area}/{module}/
├── domain/
├── application/
├── infrastructure/
├── ui/
└── routes.ts
```

## Documentation

Start here:

- [docs/OVERVIEW.md](docs/OVERVIEW.md)
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)
- [docs/architecture/UX_ARCHITECTURE.md](docs/architecture/UX_ARCHITECTURE.md)
- [docs/architecture/UX_RESET_PROPOSAL.md](docs/architecture/UX_RESET_PROPOSAL.md)
- [docs/architecture/DESIGN_SYSTEM.md](docs/architecture/DESIGN_SYSTEM.md)

## Current Priorities

- replace the generic dashboard with a real workboard
- standardize the workspace shell and page composition
- strengthen traceability and action hierarchy across finance flows
- align docs, skills, and implementation so the UX stops drifting
