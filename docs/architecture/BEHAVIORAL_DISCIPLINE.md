---
title: 'Behavioral Discipline & Orchestration'
description: 'Rules for enforcing the Controller as the absolute authority through State Machines and the Binding API.'
tier: frontend
tags: [frontend, architecture, behavioral-discipline, acumatica]
---

# Behavioral Discipline

> **Status:** Accepted (Phase 5)
> **Parent:** `ACUMATICA_ALIGNMENT_STRATEGY.md`

## Core Principle

What makes the frontend "Acumatica-grade" is not the folder structure, but **how strictly the system enforces that all behavior flows through a single, authoritative controller governing a state machine.**

The View (`view.vue`) is **not allowed** to mutate data, fetch data, or make business logic decisions. It is purely a projection of the controller.

## 1. Controller Authority (The PXGraph)

The Screen Controller must be treated as a Class-like module, not a loose helper composable.

### Rules:

1. **Owns Data Access:** The controller's `load()` or setup routine must directly fetch data (`api.get()`). It does not rely on external `useQuery` hooks passed in.
2. **Dual-Layer State Machine:** The controller must evaluate permissions based on:
   - **UIState:** `INITIALIZING`, `NEW`, `VIEW`, `EDIT`, `SAVING`
   - **DomainState:** `DRAFT`, `SUBMITTED`, `APPROVED`, etc.
3. **Mutation Guards:** A command or field mutation must physically throw or block execution if the State Machine dictates the record is read-only.

## 2. Workflow-Aware Commands (The PXAction)

Commands are not just click handlers; they represent workflow transitions.

### Rules:

1. Every command defines `from` (allowed states) and `to` (target state).
2. The controller disables or hides the command automatically if the current `DomainState` is not in the `from` list.
3. **Execution Flow:** `transitionUI('SAVING')` -> `api.execute()` -> `transitionUI('VIEW')` -> `refreshData()`.

## 3. The Binding Layer

Components must **never** be passed raw strings or objects via `value="data.prop"`. They must be bound using the strict Binding API.

### Composables:

- `useField(key)`: Injects the controller, retrieves the memoized value via `select()`, evaluates `readonly` against the State Machine and `FieldDefinition`, and exposes an `onChange` mutation command.
- `useGrid(key)`: Retrieves a subgraph array. It is the exact same source as fields. Grids **do not** fetch their own data.
- `useCommand(key)`: Binds a button to a workflow action.

### Example View Constraints:

**WRONG:**

```vue
<!-- View contains logic and direct mutation -->
<AppField :value="data.status" @update="saveStatus" :readonly="data.status === 'RELEASED'" />
```

**RIGHT:**

```vue
<!-- View is pure projection via Binding API -->
<AppField v-bind="useField('status')" />
<AppButton v-bind="useCommand('release')" />
```

## 4. Rich Field Definitions

`fields.ts` acts as the central registry for field behaviors, not just lookup values.

### The `FieldDefinition` Interface:

- `key`: The domain identity.
- `label`: UI label.
- `type`: Render archetype.
- `readonly: (state) => boolean`: Dynamic evaluation.
- `required: (state) => boolean`: Dynamic evaluation.

By moving this logic to the definition, the controller can evaluate it centrally, and the View simply renders the result.
