---
title: 'Migration Roadmap'
description: 'Phased roadmap for migrating Abren ERP frontend to Acumatica-style screen runtime, design system contracts, and workspace platform.'
tier: frontend
tags: [frontend, migration, architecture, acumatica]
---

# Migration Roadmap

> **Status:** Proposed
> **Parent:** `ACUMATICA_ALIGNMENT_STRATEGY.md`

## Guiding Rule

Do not big-bang rewrite the frontend. Add the screen runtime beside the current route/page model, then migrate one screen family at a time.

## Phase 0: Governance

- Adopt `ACUMATICA_ALIGNMENT_STRATEGY.md` as the governing direction.
- Keep existing architecture docs, but mark route/page-first assumptions as transitional.
- Add an ADR: "Screen runtime is the frontend architectural authority."
- Define screen ID convention.

Deliverable: agreed architecture package.

## Phase 1: Runtime Foundation

- Create `src/platform/screen-runtime`.
- Move or re-export `src/shared/workspace/*`.
- Harden types: `ScreenDefinition`, `ScreenView`, `ScreenCommand`, `ScreenInstance`, `ScreenConfiguration`.
- Add `ScreenRegistry`.
- Add `ScreenRouteResolver`.
- Add compatibility `ScreenRouteRenderer`.

Deliverable: router can open a registered screen that still renders an existing SFC.

## Phase 2: AP Pilot Structure

- Add `src/modules/finance/ap/screens.ts`.
- Add `src/modules/finance/ap/workspace.ts`.
- Add `AP3010PL.screen.ts` for payment request list.
- Add `AP301000.screen.ts` for payment request focus.
- Move payment request command metadata into `commands/`.
- Move payment request field/control metadata into `fields/`.
- Move payment request grid metadata into `grids/`.

Deliverable: AP payment requests are route-compatible but screen-registered.

## Phase 3: Component Contract Layer

- Create `src/platform/component-contracts`.
- Add contract registry.
- Register button, dialog, fieldset, template, tabs, grid, selector, More menu, title bar, and record services contracts.
- Add runtime warnings for missing ID/preset/label metadata.
- Add lint checks where feasible.

Deliverable: new business UI primitives are contract-governed.

## Phase 4: ERP Design System Primitives

- Build `AppTemplate`.
- Build `ScreenTitleBar`.
- Build `ScreenToolbar`.
- Build `MoreMenu`.
- Build `RecordServicesMenu`.
- Extend `DataGrid` with `DataGridPreset`.
- Add `GridColumnDefinition`.
- Extend Field System with `FieldControlDefinition`.

Deliverable: screen renderer can compose Acumatica-style screen surfaces.

## Phase 5: Shell Services

- Build global search overlay that preserves active screen instance.
- Build recently viewed records.
- Build favorite screens and favorite records.
- Build favorite commands.
- Build configurable workspace menu.
- Add business date display/change flow.
- Add tenant/company/branch selector.
- Add help/screen tools hooks.

Deliverable: shell behaves like a persistent ERP working environment.

## Phase 6: Screen Taxonomy Coverage

Convert one screen of each kind:

| Kind       | Candidate                        |
| ---------- | -------------------------------- |
| Workspace  | Payment Requests                 |
| Data Entry | Payment Request Focus            |
| Setup      | Ledger Settings                  |
| Inquiry    | Journal Entries or Cashflow view |
| Processing | Batch approval/payment execution |
| Report     | First finance report             |

Deliverable: all major Acumatica screen kinds are represented.

## Phase 7: Personalization And Configuration

- Add `ScreenConfiguration` persistence.
- Add tab hide/reorder.
- Add section collapse/hide/reorder.
- Add saved personal/shared/default filters.
- Add grid column visibility/order/width persistence.
- Add admin-shared layout application.

Deliverable: personalization becomes platform behavior.

## Phase 8: Backend Metadata Integration

- Backend exposes field state, permissions, workflow actions, validation, visibility, and record services capability metadata.
- Frontend screen definitions become mostly static layout and renderer contracts.
- Runtime merges backend metadata with local screen definitions, tenant extensions, and user/system personalization.

Deliverable: frontend screens are metadata-backed rather than page-authored.

## Exit Criteria

The migration is successful when new business screens cannot be built as bespoke route pages. They must be registered screens with:

- screen ID
- screen kind
- views
- layout template
- field/control definitions
- grid presets and column definitions
- commands
- component IDs
- localization keys
- test containers
- personalization policy
