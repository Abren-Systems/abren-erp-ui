# Architectural Invariants

This document formalizes the inviolable rules governing the three deterministic runtimes of the Abren ERP frontend. These rules prevent architectural drift and are enforced by the `arch-guard` static analysis tool.

## Navigation Authority Invariants (NAI)

The **Navigation Runtime (State A)** manages the Workspace View (module landing pages). It operates on a strict `Definition → Projection → Renderer` pipeline.

| ID         | Rule                                                                       | Rationale                                                                                                                    |
| ---------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **NAI-01** | **Workspace components must not evaluate authorization directly.**         | Banned: `v-if="user.role === 'admin'"`. Must use evaluated `workspaceModel.capabilities`. Preserves renderer purity.         |
| **NAI-02** | **Workspace visibility must resolve outside the rendering layer.**         | No conditional tile construction or filtering inside Vue components. The model must be pre-filtered.                         |
| **NAI-03** | **Workspace links must resolve from contracts, not hardcoded routes.**     | Banned: `router.push('/finance/ap/AP301000')`. Must emit `navigate(screenId)`. Enables route evolution and deep linking.     |
| **NAI-04** | **Workspace projection resolution must be synchronous and deterministic.** | No `async`, `await`, `fetch`, or reactive watchers inside `resolveWorkspaceModel()`. Prevents race conditions in navigation. |
| **NAI-05** | **Workspace renderers must not access router state directly.**             | Banned: `useRoute()`, `useRouter()`. Navigation state enters through `WorkspaceModel` only.                                  |

## Screen Authority Invariants (SAI)

The **Screen Runtime (State B)** manages the Working Area (forms, grids, dashboards).

| ID         | Rule                                             | Rationale                                                                                                                       |
| ---------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **SAI-01** | **Controllers must be pure projection mappers.** | Controllers cannot mutate state directly; they map `ScreenDefinition` and state to `ScreenModel`.                               |
| **SAI-02** | **Renderers must not evaluate business logic.**  | Renderers (e.g., `ScreenRenderer`, `AppTemplate`) only consume `ScreenModel`. They cannot calculate visibility or requirements. |
| **SAI-03** | **Chrome is non-negotiable.**                    | Forms must use `FormTitleBar` / `FormToolbar`. Lists must use `ListTitleBar` / `GridToolbar`. No manual chrome construction.    |

## Semantic Authority Invariants (SMI)

The **Canonical Semantic Runtime** manages meaning, validation, and formatting for data points across the platform.

| ID         | Rule                                                           | Rationale                                                                                                                      |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **SMI-01** | **Money fields must use semantic rendering.**                  | Banned: `type: 'number'` for monetary fields without `semantic: 'Money'`. Ensures universal currency formatting and precision. |
| **SMI-02** | **Status fields must use semantic rendering.**                 | Prevents raw strings from rendering where localized badges with severity colors are required.                                  |
| **SMI-03** | **Views must not manually format semantic values.**            | Banned: `amount.toFixed(2)` inside views. Formatting belongs exclusively to the Semantic Runtime.                              |
| **SMI-04** | **Semantic contracts must remain serializable and stateless.** | No reactive refs, closures, or mutable runtime state inside semantic definitions.                                              |
| **SMI-05** | **Views must not infer semantics manually.**                   | Banned: `if (field.name.includes('Amount'))`. All meaning must explicitly come from the `semantic` property.                   |
