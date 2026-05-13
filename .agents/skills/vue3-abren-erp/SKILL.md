---
name: Vue 3 Abren ERP Development
description: Patterns and guardrails for building the Abren ERP UI with Vue 3, TypeScript, TanStack Query/Table, and the v3.0 Deterministic Runtime architecture.
---

# Vue 3 Abren ERP Development Skill

> **Architecture Authority:** [`docs/architecture/ARCHITECTURE.md`](../../docs/architecture/ARCHITECTURE.md) (v3.0, Locked Baseline)
> **Key Companions:** [`docs/architecture/ACUMATICA_ALIGNMENT.md`](../../docs/architecture/ACUMATICA_ALIGNMENT.md) (Rosetta Stone) · [`docs/architecture/SCREEN_RUNTIME.md`](../../docs/architecture/SCREEN_RUNTIME.md) (Runtime) · [`docs/architecture/SCREEN_MIGRATION.md`](../../docs/architecture/SCREEN_MIGRATION.md) (Migration Guide) · [`docs/architecture/COMPONENT_SYSTEM.md`](../../docs/architecture/COMPONENT_SYSTEM.md) (UI & Contracts)
> This skill provides AI-specific guardrails for the **deterministic execution architecture**. Defer to the Manifesto for structural rules.

## Core Rules

1. **Always** use Vue 3 Composition API with `<script setup lang="ts">`.
2. **Always** use strict TypeScript. `any` is strictly banned. Use `unknown` + type guards.
3. **Always** use **Branded Types** for IDs (`UserId`, `AccountId`) and **IsoDate** for strings. Use `toId<T>(val)` helper.
4. **Always** preserve the 4-layer module architecture: Domain, Application, Infrastructure, UI.
5. **Always** use **Zod Shielding** in `infrastructure/schemas.ts` to parse all backend DTOs.
6. **Always** keep server state in **TanStack Query**. Do not duplicate domain data in Pinia.
7. **Always** place screen folders directly under `ui/` keyed by **Screen ID** (e.g., `AP301000/`).
8. **Never** import across module internals. Cross-module coordination must go through the **Event Bus**.
9. **Never** move business logic into `shared/`. Use the **Shared Semantic Kernel** for module-agnostic components.
10. **Absolute Doctrine**: **The UI does not decide truth. The runtime derives truth.** Components render the `ScreenModel` strictly.

## Product UX Doctrine (The Three Runtimes)

When building UI, assume Abren is governed by three deterministic runtimes:

1. **Navigation Runtime (State A)**: The authoritative environment for **Workspaces**. It projects `WorkspaceDefinition` (tiles/links) into the center area.
2. **Screen Runtime (State B)**: The authoritative environment for **Working Areas**. It projects `ScreenDefinition` and business state into a `ScreenModel`.
3. **Canonical Semantic Runtime**: The authoritative meaning registry. Maps primitive data to business semantics (Money, Quantity, Status).

### Interaction Grammar

- **Sequential Progressive Disclosure**: Always follow the `List (PL) -> Detail (000)` path. Never render list and detail simultaneously (no master-detail splits).
- **Standardized Form Anatomy**: Every Working Area form has exactly 6 parts: Title Bar, Toolbar, Summary, Tabs, Details, Row.

## Structural Patterns (Area Codes)

Every route corresponds to an 8-character Screen ID with strict semantic meaning:

- `10` **Setup**: Configuration/Preferences (e.g., `GL102000`).
- `20` **Maintenance**: Master data (e.g., `SM201010`).
- `30` **Data Entry**: Transactional header-detail (e.g., `AP301000`).
- `PL` **Primary List**: Paired inquiry for data entry (e.g., `AP3010PL`).
- `40` **Inquiry**: Read-only analytical grids (e.g., `IN401000`).
- `50` **Processing**: Batch engines with selectable grids and "Process All" actions.
- `60` **Report**: Parameter-driven printable output.

## Component Architecture & Sizing

Avoid the **SFC God-Component** anti-pattern. Pages are orchestrators, not implementers.

1. **Size Limits**: SFCs **must** remain under 200 lines. Above 300 lines is a critical failure.
2. **Extraction Triggers**: Extract side panes (`SidePanel.vue`), action bars, and complex grids into dedicated child components.
3. **State Delegation**: Parent page holds the core data; children receive props and emit events.

## Shared UI Expectations

- **`<AppField>`** — The **only** way to display data fields.
- **`<AppFieldset>`** — The **only** way to group fields. No raw `<div class="grid">`.
- **`<AppTemplate>`** — named templates for Summary Area widths (e.g., `7-10-7`).
- **`FormTitleBar`** — Renders record context (ID, Title, Notes, Files). Used for 10, 20, 30.
- **`ListTitleBar`** — Minimal title-only bar. Used for PL, 40, 50, 60.
- **`FormToolbar`** — Renders declarative commands from the `ScreenModel`.

### DataGrid Contract

Every inquiry/list grid **must** populate the footer:
`Showing X of Y rows  •  Total: {Currency} X,XXX.XX  •  Selected: N`

## Deterministic Data Flow

1. **Raw Domain State** (TanStack Query) + **ScreenDefinition** (Metadata)
2. **Projection Engine** (`resolveScreenModel`)
3. **ScreenModel** (Reactive Projection)
4. **Binding API** (`useField`, `useGrid`, `useCommand`)
5. **Pure View** (`view.vue`)

### Projection Tiers (ADR-0018)

The runtime enforces strict capability boundaries based on operational depth:

- **Tier 1 (Lightweight):** Use `LightweightOperationalEntity` for grids/lists. Contains only `version` and `lifecycleStatus`.
- **Tier 2 (Full):** Use `OperationalEntity` for detail views and mutations. Contains full action graph and field permissions.
- **Guard:** Always use `assertFullProjection(entity)` before accessing `__operations.actions` or `__operations.permissions`.

## Field System (Non-Negotiable)

1. **field/label separation**: Stable `field` key distinct from display `label`.
2. **Value purity**: Pass raw domain values only; formatting is handled by the Registry.
3. **No conditional rendering**: Use `isVisible` in the controller; null renders as `"—"`.
4. **Registry Types**: `text` | `money` | `status` | `date` | `id` | `number` | `selector`.

## What To Avoid

- **Legacy Terminology**: Never use "Workboard", "Queue", or "Triage" in new code. Use "Workspace View" or "Inquiry".
- **Direct Binding**: Never bind components to raw business state (e.g., `v-model="entity.amount"`). Use `useField('amount')`.
- **Inference in UI**: Never check `if (status === 'APPROVED')` in a component. Use the Projection's capability flags (`field.readonly`, `command.visible`).
- **Tier Mixing**: Never put Tier 2 (`OperationalEntity`) in a list store, and never pass Tier 1 (`LightweightOperationalEntity`) to a detail view.
- **Inline editing**: Mutate only via sanctioned Forms or Drawers.
- **Raw HTML for data**: `<span>{{ val }}</span>` is banned in business screens. Use `AppField`.

## Implementation Bias

- **Graph-Centric Behavior**: All field cascades (`watch`) live in the `controller.ts` (The Graph).
- **Layer Isolation**: Keep `infrastructure/` as a strict firewall using Mappers and Zod.
- **Screen ID alignment**: Name files, routes, and folders by their 8-character ID.
- **Full-Stack Symmetry**: Use the same module and action names as the backend.
