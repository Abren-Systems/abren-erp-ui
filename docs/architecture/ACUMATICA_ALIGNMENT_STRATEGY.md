---
title: 'Acumatica Alignment Strategy'
description: 'Governing strategy for aligning Abren ERP frontend architecture, structure, design system, components, and UX with Acumatica.'
tier: frontend
tags: [frontend, architecture, acumatica, strategy]
---

# Acumatica Alignment Strategy

> **Status:** Proposed
> **Companions:** `SCREEN_RUNTIME_ARCHITECTURE.md`, `ERP_DESIGN_SYSTEM_ARCHITECTURE.md`, `COMPONENT_CONTRACTS.md`, `MODULE_RESTRUCTURE_PLAN.md`, `MIGRATION_ROADMAP.md`

## Decision

Acumatica is the structural reference for Abren ERP's frontend. We are not copying a visual theme. We are adopting the operating model:

```text
Persistent Shell
  -> Workspace
    -> Screen Instance
      -> Screen Definition
        -> Views
        -> Layout
        -> Commands
        -> Component Contracts
        -> Personalization
```

The existing frontend is a good modular Vue application. The target is stricter: an ERP screen operating system.

## Strategic Shifts

1. **Route/page to screen runtime:** routes locate screens; they do not define product structure.
2. **Component library to ERP design system:** shared UI components become governed business primitives.
3. **Local page composition to metadata rendering:** fields, grids, tabs, actions, dialogs, and record services are declared in screen metadata.
4. **Static shell to persistent workspace:** search, recently viewed records, favorites, business date, help, workspace menus, and active screen instances become platform services.
5. **Developer convention to enforceable contract:** IDs, labels, grid presets, command placement, localization, test containers, and personalization are required.

## Current-State Assessment

Strong foundations:

- 4-layer module architecture: `domain`, `application`, `infrastructure`, `ui`.
- Domain-aligned modules under `src/modules`.
- Abren-owned Field System and DataGrid.
- Early screen/workspace/controller/command types under `src/shared/workspace`.
- AP payment request list/focus screens as useful pilots.

Primary gaps:

- `ModuleDefinition` is still route/menu-first.
- Router loads SFC pages directly.
- `AuthenticatedLayout` is a layout shell, not a persistent working environment.
- Shared components are grouped by implementation category instead of ERP contract role.
- Page SFCs still own too much layout, command, field, grid, and dialog structure.
- DataGrid lacks Acumatica-level presets, saved filters, column personalization, and row services.
- Field System lacks full control metadata for selectors, combo boxes, radio groups, masks, uploads, and rich editors.

## Target Architecture Package

| Document                            | Role                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `SCREEN_RUNTIME_ARCHITECTURE.md`    | Defines the screen registry, screen instances, views, commands, and renderer.  |
| `ERP_DESIGN_SYSTEM_ARCHITECTURE.md` | Defines the design system layers and Acumatica-style ERP UI primitives.        |
| `COMPONENT_CONTRACTS.md`            | Defines ID, label, placement, configuration, personalization, and test rules.  |
| `MODULE_RESTRUCTURE_PLAN.md`        | Defines how module exports and UI folders change from routes/pages to screens. |
| `MIGRATION_ROADMAP.md`              | Defines phased implementation and pilot sequence.                              |

## North Star

The first successful milestone is:

> `PaymentRequestsListPage` and `PaymentRequestFocus` can be opened through registered Acumatica-style screen definitions, rendered through shared screen primitives, and described by metadata for layout, commands, fields, grids, IDs, permissions, localization, and personalization.
