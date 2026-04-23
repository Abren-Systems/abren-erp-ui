# Foundation UI Components Guide

This document defines how UI components are built and consumed in Abren ERP.

## 1. Ownership First

Business modules must consume **Abren-owned shared components**, not raw vendor primitives.

That means:

- use `App*` primitives from `src/shared/components/primitives/`
- use shared page-kit components from `src/shared/components/workspace/`
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

### 4.2 Page-Kit Layer

Use composition components for repeatable page structure:

- `PageHeader`
- `WorkspacePanel`
- `MetricStrip`
- `EmptyState`
- `TraceSection`

Pages should not reinvent these layouts ad hoc.

## 5. ERP Density Rules

Abren is a dense operational interface.

Default expectations:

- compact controls
- tight but readable grouping
- low-ceremony page chrome
- tables should claim viewport priority on list pages
- whitespace must earn its keep by improving scan speed or reducing errors

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

## 7. Data Grid Exception

TanStack remains the structural engine for data-heavy UI.

Rules:

- use the shared `DataGrid` host
- use shared cells and shared primitives inside grid definitions
- do not adopt vendor-owned data grid components that break Vue context or product ownership

## 8. Refactor Expectation

When touching a shared primitive:

- improve the Abren-facing API if needed
- preserve headless ownership and avoid vendor leakage
- avoid unnecessary rewrites if the task is unrelated
- leave the component more clearly aligned with the headless Abren-owned direction

## 9. One Rule to Remember

> Vendor libraries may provide behavior. Only Abren defines the interface.
