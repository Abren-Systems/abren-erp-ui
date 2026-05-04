---
title: 'ERP Design System Architecture'
description: 'Design system architecture for Acumatica-style ERP UI primitives, screen components, and platform shell components.'
tier: frontend
tags: [frontend, design-system, architecture, acumatica]
---

# ERP Design System Architecture

> **Status:** Proposed
> **Parent:** `ACUMATICA_ALIGNMENT_STRATEGY.md`

## Purpose

The design system must become an ERP operating layer, not just shared Vue components. It should constrain how business screens are built so that Acumatica alignment is automatic and repeatable.

## Current State

Current shared UI lives mostly under:

```text
src/shared/components/
├── primitives/
├── field-system/
├── data-grid/
├── workspace/
├── dialog/
├── dropdown-menu/
├── sheet/
└── table/
```

This is useful, but the layers are mixed. Primitive wrappers, ERP components, screen components, and platform shell pieces need clearer roles.

## Target Layers

```text
src/shared/ui/
├── primitives/
│   ├── button/
│   ├── input/
│   ├── select/
│   ├── checkbox/
│   ├── dialog/
│   └── popover/
├── erp/
│   ├── AppField.vue
│   ├── AppFieldset.vue
│   ├── AppTemplate.vue
│   ├── AppTabs.vue
│   ├── AppDialog.vue
│   ├── AppSelector.vue
│   └── DataGrid.vue
└── screen/
    ├── ScreenTitleBar.vue
    ├── ScreenToolbar.vue
    ├── MoreMenu.vue
    ├── ScreenSummary.vue
    └── RecordServicesMenu.vue
```

Platform shell components belong under `src/app/shell` or `src/platform/navigation`, not inside generic shared UI:

```text
src/app/shell/
├── AcumaticaShell.vue
├── GlobalSearchWorkspace.vue
├── RecentlyViewedMenu.vue
├── WorkspaceMenu.vue
├── TenantContextMenu.vue
└── HelpMenu.vue
```

## Design System Principles

- ERP components are contract-driven.
- Business screens use `AppField`, `AppFieldset`, `AppTemplate`, `AppTabs`, `DataGrid`, and screen components.
- Low-level primitives stay available, but business screens should not compose raw primitives directly for screen structure.
- Named templates replace arbitrary business screen grid layouts.
- Grid presets replace per-page grid behavior.
- Command renderers replace ad hoc action bars.
- Record services are standardized, not module-specific.

## Required ERP Components

| Component            | Purpose                                                         |
| -------------------- | --------------------------------------------------------------- |
| `AppTemplate`        | Named layout templates such as `1-1`, `7-10-7`, `17-17-14`.     |
| `AppField`           | Metadata-driven field display/edit rendering.                   |
| `AppFieldset`        | Governed section grouping with label and layout rules.          |
| `AppTabs`            | Personalizable tabs with noun labels and no single-tab screens. |
| `DataGrid`           | ERP grid platform with presets, columns, filters, layouts.      |
| `ScreenTitleBar`     | Title, record title, state, record services, screen tools.      |
| `ScreenToolbar`      | Standard actions, command favorites, expected next action.      |
| `MoreMenu`           | Categorized actions, disabled-visible commands, overflow.       |
| `RecordServicesMenu` | Notes, files, activities, audit, link, notifications.           |

## Visual Doctrine

- Calm density over dashboard decoration.
- Strong hierarchy through spacing, labels, sectioning, and command placement.
- Financial data uses tabular alignment and predictable grids.
- Accent color is scarce and action/state meaningful.
- The UI should feel like one operating system across modules.

## Migration Approach

Do not move all components at once. First define the target layers, then:

1. Add `AppTemplate`.
2. Add screen components beside existing shared components.
3. Extend `DataGrid` with presets and column metadata.
4. Introduce component contracts.
5. Migrate AP pilot screens.
6. Gradually move `src/shared/components` into `src/shared/ui` when imports are stable.
