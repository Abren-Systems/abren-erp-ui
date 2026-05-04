# Foundation UI Components Guide

> **Last Updated:** May 2026

This document defines how UI components are built and consumed in Abren ERP. All components exist within the [Four Foundations](./UX_ARCHITECTURE.md#0-the-four-foundations-app-shell) (Top Pane, Sidebar, Workspace, Working Area).

It should be read together with `ERP_DESIGN_SYSTEM_ARCHITECTURE.md` and `COMPONENT_CONTRACTS.md`, which define the target layer model and contract system for Acumatica-style ERP UI.

## 1. Ownership First

Business modules must consume **Abren-owned shared components**, not raw vendor primitives.

That means:

- use Abren-owned primitives and ERP components from `src/shared/ui/` as the target structure
- during migration, compatibility exports from `src/shared/components/` are acceptable
- do not mount raw third-party UI primitives in module pages

The product contract belongs to Abren, not to any vendor library.

## 2. Headless Direction

Abren’s long-term direction is:

- **headless accessibility and behavior**
- **Abren-owned appearance and composition**

The preferred behavior layer is **Reka UI / Radix-Vue lineage primitives** for things like:

- dialogs
- menus
- overlays
- labels
- popovers

These primitives should remain invisible at the product-language level. Users should experience Abren, not a library.

## 3. No Fluent Reintroduction

The old Fluent-based wrapper layer is no longer part of the active shared primitive foundation.

Rules:

- do not reintroduce raw `<fluent-*>` tags
- do not rebuild product doctrine around Fluent tokens or appearance
- if a new primitive is needed, build it through Abren-owned headless composition

## 4. Component Layers

### 4.1 Primitive Layer

Use primitives for atomic interactions:

- `AppButton`
- `AppInput`
- `AppSelect`
- `AppBadge`
- `AppDrawer`
- `AppDialog`
- `AppSidePane` — Side Panel for contextual overlays: `mode="overlay"` for filters, `mode="docked"` for Quick Triage trace panes (maps to Acumatica's "Side Panel" concept)

### 4.2 Screen Layer

Use composition components for repeatable screen structure:

- `ScreenTitleBar`
- `ScreenToolbar`
- `MoreMenu`
- `RecordServicesMenu`
- `WorkspacePanel`
- `EmptyState`

Screens should not reinvent these layouts ad hoc.

### 4.3 Field System Layer (Working Area)

The Field System governs all data display and layout inside the Working Area. See [Field System Architecture](../FIELD_SYSTEM.md) for the full specification.

- `AppField` — The **only** way to display a data field. Pure semantic renderer.
- `AppFieldset` — The **only** layout engine. CSS Grid authority with `140px` baseline.
- `FieldGroup` — Lightweight semantic sub-grouping (no layout of its own).
- `AppTemplate` — Named screen template authority for Acumatica-style slot widths.
- `AppTabs` — Stateless visibility toggle for data strata.
- `DataGrid` — The **only** tabular rendering system, evolving into a preset-driven ERP grid platform.

> [!IMPORTANT]
> **"Fields define meaning, Fieldsets define layout."** — `AppField` must never decide its own layout. `AppFieldset` must never interpret business values. This separation is the foundation for Phase 3 (Metadata-Driven Screens).

## 5. ERP Density Rules

Abren is a dense operational interface.

Default expectations:

- compact controls
- tight but readable grouping
- low-ceremony page chrome
- tables should claim viewport priority on list pages
- whitespace must earn its keep by improving scan speed or reducing errors

### DataGrid Footer

Every financial Workspace list page must populate the `DataGrid` `#footer` slot with:

- **Row count:** `Showing X of Y rows`
- **Financial aggregate:** `Total: ETB X,XXX.XX` (sum of the primary amount column)
- **Selection count** (shown only when `selectedCount > 0`): `Selected: N`

This is not optional chrome — it is operational data that finance users need at a glance without scrolling. As the screen runtime matures, this footer content should come from grid metadata rather than page-by-page convention.

## 6. Styling Rules

Use Abren tokens from `src/assets/main.css`.

Prefer:

- semantic color roles
- surface hierarchy
- compact spacing
- readable numeric alignment

Avoid:

- hardcoded vendor colors
- library-default sizing assumptions
- decorative card inflation
- page-specific visual hacks that bypass shared tokens

## 7. Data Grid Platform

TanStack remains the structural engine for data-heavy UI.

Rules:

- use the shared `DataGrid` host
- use shared cells and shared primitives inside grid definitions
- add grid presets and column metadata instead of ad hoc per-screen behavior
- do not adopt vendor-owned data grid components that break Vue context or product ownership

## 8. Refactor Expectation

When touching a shared primitive:

- improve the Abren-facing API if needed
- preserve headless ownership and avoid vendor leakage
- avoid unnecessary rewrites if the task is unrelated
- leave the component more clearly aligned with the headless Abren-owned direction

## 9. One Rule to Remember

> Vendor libraries may provide behavior. Only Abren defines the interface.
