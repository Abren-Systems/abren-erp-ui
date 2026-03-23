# UI Component Architecture

> **Parent:** [Frontend Architecture](ARCHITECTURE.md)
> **Stack:** Vue 3 + Tailwind CSS v4 + Reka UI (Headless) + shadcn-vue + Custom Design System

---

## 1. The Four-Tier Component Model

To ensure scalability and prevent "component soup," we categorize all UI elements into four distinct tiers based on their knowledge of the business domain.

### Tier 2: Shared Patterns (Core UI)

- **Location**: `src/core/ui/shared/`
- **Nature**: Reusable organisms (FormLayout, AppModal).
- **Knowledge**: Layout knowledge, zero business domain knowledge.
- **Rule**: Accessible to all modules. **Must remain domain-agnostic.**

### Tier 3: Domain Components (Module UI)

- **Location**: `src/modules/{category}/{module}/ui/components/`
- **Nature**: Reusable molecules (AccountBadge, PaymentStatusBadge).
- **Knowledge**: Full knowledge of Module Domain Types.
- **Guardrail**: **Strictly stateless** (or locally UI-stateful). **Never** fetch data or orchestrate workflows.
- **Rule**: Purely presentational for a specific domain.

### Tier 4: Feature Pages (Module UI)

- **Location**: `src/modules/{category}/{module}/ui/pages/`
- **Nature**: The "Orchestrators."
- **Knowledge**: Full knowledge of the Use Case (Application layer).
- **Constraint**: **NEVER** call TanStack Query or API directly. **MUST** use application composables.

---

## 2. Component Directory Structure

```
src/
├── core/ui/
│   ├── primitives/          # Tier 1
│   ├── data-grid/           # Foundational UI Engine (Special)
│   └── shared/              # Tier 2
│
└── modules/business/ledger/ui/
    ├── components/          # Tier 3 (Domain-Owned)
    ├── pages/               # Tier 4 (Feature Pages)
    ├── grids/               # Grid Configuration Layer (NEW)
    └── utils/               # UI Logic Layer (Formatting)
```

---

## 4. The DataGrid Engine

The DataGrid is not a standard "shared component"—it is a foundational UI engine.

- **Location**: `src/core/ui/data-grid/`
- **Structure**:
  - `core/`: Headless engine (virtualization, keyboard nav, TanStack Table setup).
  - `plugins/`: Generic behaviors (sorting, filtering, selection).
- **Reasoning**: Treating the grid as an engine prevents domain leakage and ensures high-performance optimizations stay centralized.

---

## 5. Grid Configuration Layer (New)

To keep `.vue` files focused on layout, move all column and grid definitions to a dedicated layer.

- **Location**: `src/modules/{module}/ui/grids/`
- **Pattern**: `{entity}.grid.ts`
- **Example**: `account.grid.ts` exports column definitions and default visibility states.

---

## 6. UI Logic Layer (Formatting)

Business logic belongs in `domain/`, but **Display Logic** belongs in `ui/utils/`.

- **Purpose**: Formatter functions (currency, dates), status-to-color mapping, icon selection.
- **Enforcement**: Ensures components stay focused on template composition.

---

## 7. Scaling Strategy (The Prop-Driven Flow)

To keep the UI testable and high-performance, follow the **Props In, Events Out** rule:

1.  **Pages** receive data from **Application Composables** (which wrap TanStack Query).
2.  **Pages** pass raw reactive objects (Domain Types) down to **Domain Components**.
3.  **Domain Components** decompose those objects and pass primitives (strings, numbers) down to **UI Primitives**.
4.  **UI Primitives** emit generic events (`click`, `update:modelValue`).
5.  **Pages** catch events and call mutation methods from the **Application Composable**.

---

## 8. Hard Rules for Scalability

| Rule                                | Rationale                                        |
| ----------------------------------- | ------------------------------------------------ |
| **NO TanStack Query in Pages**      | Use the application composable.                  |
| **NO Business Logic in Components** | Components are for display and composition only. |
| **NO API calls in Tier 1-3**        | Data fetching is an Application/Page concern.    |
| **NO Grid Columns in .vue Files**   | Use the `ui/grids/` layer.                       |
