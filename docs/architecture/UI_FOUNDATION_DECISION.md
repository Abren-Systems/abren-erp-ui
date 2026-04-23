# ADR: UI Foundation Reset

## Status

Accepted

## Decision

Abren ERP will use a **headless, Abren-owned UI architecture**:

1. **Abren owns the design language**
   - tokens
   - primitives
   - page-kit components
   - density rules
   - motion and visual hierarchy
2. **Headless primitives provide accessibility and behavior**
   - the target direction is **Reka UI / Radix-Vue lineage primitives**
   - they are infrastructure, not product identity
3. **TanStack remains the grid and heavy-data engine**
4. **Fluent is historical context, not an active foundation layer**
   - it should not be reintroduced into shared primitives
   - new product direction must not expand Fluent-first architecture

## Context

Abren needs a frontend that feels like an operational finance workspace, not a vendor-themed admin template.

The earlier Fluent-first pivot solved some short-term problems:

- fast access to accessible atoms
- higher baseline polish than raw prototypes
- a clear wrapper mandate

But it also created long-term problems:

- the product identity drifted toward Microsoft rather than Abren
- Shadow DOM and token bridging increased implementation friction
- the codebase ended up with two primitive stories:
  - legacy Fluent wrappers
  - headless/shared Vue components
- UX architecture and implementation began to diverge

The team has now made a clearer product decision:

> Abren should be a **workboard-first financial operations workspace** with its own design language.

That decision favors ownership over imitation.

## What We Evaluated

### Option 1: Fluent as long-term foundation

Pros:

- mature accessible atoms
- recognizable enterprise feel
- lower short-term styling burden for some controls

Cons:

- too much vendor identity
- Shadow DOM friction
- awkward fit for Abren-owned dense page composition
- encourages the product to look derivative

### Option 2: Carbon as long-term foundation

Pros:

- excellent enterprise rigor
- strong systemization
- solid accessibility posture

Cons:

- equally strong vendor identity
- would still make Abren feel borrowed
- does not solve the need for Abren-specific workflow grammar

### Option 3: Headless primitives + Abren-owned system

Pros:

- full ownership of product language
- clean separation between behavior and appearance
- best fit for ERP-specific density and workflow surfaces
- easiest long-term evolution once foundations settle

Cons:

- more up-front design and component work
- requires discipline across primitives, page-kit, and tokens

## Final Direction

Abren will standardize on this structure:

### 1. Headless behavior layer

Use headless accessible primitives from the **Reka UI / Radix-Vue lineage** for behaviors such as:

- dialogs
- dropdowns
- popovers
- labels
- menus
- overlays

### 2. Abren primitive layer

Abren-owned `App*` components define the product contract:

- `AppButton`
- `AppInput`
- `AppSelect`
- `AppBadge`
- `AppDialog`
- `AppDrawer`

These are the only primitives business modules should consume.

### 3. Abren page-kit layer

Shared composition components define page grammar:

- `PageHeader`
- `WorkspacePanel`
- `MetricStrip`
- `EmptyState`
- `RecordHero`
- `TraceSection`

### 4. Heavy-data layer

Use TanStack for:

- tables
- virtualization
- sorting
- filtering
- bulk selection

## Fluent Policy

Fluent is **not** the product direction anymore.

Current policy:

- do not reintroduce raw Fluent usage
- do not build new product doctrine around Fluent tokens or appearance rules
- remove stale dependency or bootstrap remnants when found

This means Fluent is historical context, not an active foundation layer.

## Consequences

### Positive

- Abren gets its own recognizable design language
- accessibility remains strong through headless primitives
- UI architecture aligns with the workboard/workspace/focus/trace model
- the team can evolve density and visual identity without vendor lock-in

### Negative

- old wrapper decisions may still show up in historical docs or commits
- dependency cleanup still needs to follow implementation cleanup
- more responsibility shifts to the team to maintain quality and consistency

## Implementation Rules

1. Business modules must only consume Abren-owned shared components.
2. Raw vendor primitives must not appear in business pages.
3. New shared primitives should prefer headless foundations over vendor visual components.
4. Fluent must not be reintroduced without an explicit ADR.
5. New visual design decisions should reference Abren tokens and page grammar, not vendor aesthetics.

## Migration Plan

### Phase 1: Doctrine alignment

- update architecture and design docs
- update skills and developer guidance
- remove stale Fluent-first assumptions

### Phase 2: Page-kit stabilization

- standardize headers, panels, empty states, toolbars, and trace surfaces

### Phase 3: Primitive cleanup

- remove stale Fluent-first doctrine
- simplify token bridges
- evaluate dependency removal once no longer needed

## Summary

Abren is no longer choosing between Fluent or Carbon as a product identity.

Abren is choosing:

- **Reka-style headless behavior**
- **Abren-owned primitives and composition**
- **Abren-owned visual language**

That is the foundation that best matches the product we are actually trying to build.
