# ADR: UI Foundation and Framework Strategy

## Context & Problem Statement

Abren ERP requires a high-density, performant, and operationally rigorous frontend architecture. Early prototypes utilizing headless Vue components (Radix/Shadcn) combined with abstract Tailwind styling resulted in significant boilerplate and friction when attempting to achieve enterprise-grade functional aesthetics akin to Microsoft Dynamics 365. Furthermore, complex ERP data grids demand strict logical control decoupled from rigid styling frameworks.

We evaluated three primary contenders:

1. **Reka UI (Radix Vue)**: High accessibility, but required 100% manual styling of thousands of focus/hover states.
2. **shadcn-vue**: Accelerated speed via Tailwind templates, but resulted in "emulated" enterprise looks rather than native ones.
3. **Fluent UI (Microsoft)**: Native standards-based components

## Decision: The Native Hybrid Pivot

We have adopted a **Hybrid Wrapper Architecture** powered by native Microsoft standards:

1. **Fluent UI Web Components** (`@fluentui/web-components`): Adopted as the **Tier 1 Primitives Engine**. We utilize Microsoft's Web Standards components (FAST) to handle all interactive atoms (`Button`, `Input`, `Select`, `Dialog`).
2. **The Strategic Pivot**: We explicitly moved from "Shadcn-emulation" to **Native Fluent** to achieve 100% visual fidelity with **Microsoft Dynamics 365 Sales** without the overhead of manual CSS management.
3. **The Wrapper Mandate (Ownership)**: Raw `<fluent-*>` tags are strictly forbidden within business modules. All Fluent components must be wrapped in Abren-specific primitives (e.g., `<AppButton>`) to enforce design system consistency, ensure reactive `$emit`/`v-model` mapping, and **maintain absolute code ownership**.
4. **TanStack Table as Grid Engine**: We explicitly reject heavily coupled layout components like `<fluent-data-grid>`, which destroy Vue context reactivity. We select **TanStack Table** as our headless grid engine to manage complex ERP features while injecting our `App*` primitives into its cells.
5. **Tailwind CSS v4 & @theme**: Tailwind remains our layout engine. Since Abren ERP is strictly on the bleeding-edge **Tailwind v4**, we bypass automated component CLI tools and instead map our native CSS variables initializing in `main.css` directly to the Fluent design system.

## Brand Guardrail: Indigo Overrides

To maintain **Brand Integrity**, we do not use default Microsoft Blue. We explicitly override the Fluent Design System's `--accent-*` tokens with the **Abren Indigo (#4f46e5)** palette. This ensures an authoritative financial vibe while retaining the Dynamics 365 UI density.

## Consequences

### Positive

- **Visual Fidelity**: Inherently mimics the robust, highly accessible Dynamics 365 UI.
- **Future-Proof Grid**: TanStack secures our ability to handle complex ERP table features without fighting a Shadow DOM.
- **Ownership**: The wrapper layer prevents framework bleed, keeping our domain logic pristine and framework-agnostic.

### Negative

- **Initial API Surface Mapping**: Requires construction of robust wrapper components to bridge Vue reactivity to web-component DOM states.
- **Shadow DOM Quirks**: Integrating Tailwind layout classes with `.shadowRoot` boundaries requires careful structural discipline.
