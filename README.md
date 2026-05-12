# Abren ERP UI

Frontend for Abren ERP, an Acumatica-aligned financial operations workspace for SMEs.

## Product Direction

Abren is not being designed as a generic admin dashboard. The frontend is evolving toward:

- an **Acumatica-aligned Modern UI** experience
- dense but calm operational workspaces (Inquiry/Processing/Report)
- standardized form anatomy (Setup/Maintenance/Data Entry)
- state-machine driven center area (Workspace View vs Working Area)
- truthful UI surfaces that avoid fake metrics and placeholder theater

The definitive mental model lives in [docs/architecture/ACUMATICA_ALIGNMENT.md](docs/architecture/ACUMATICA_ALIGNMENT.md).

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
- [docs/architecture/ACUMATICA_ALIGNMENT.md](docs/architecture/ACUMATICA_ALIGNMENT.md)
- [docs/architecture/SCREEN_RUNTIME.md](docs/architecture/SCREEN_RUNTIME.md)
- [docs/architecture/UX_ARCHITECTURE.md](docs/architecture/UX_ARCHITECTURE.md)
- [docs/architecture/DESIGN_SYSTEM.md](docs/architecture/DESIGN_SYSTEM.md)

## Current Priorities

- standardize all screens using the **Acumatica Screen ID system** (e.g., AP301000)
- implement the **6-part Form Anatomy** across all financial modules
- replace legacy "workboard" triage with the **Workspace View / Working Area** state machine
- strengthen field cascades and business logic within the **Screen Controllers** (Graphs)
