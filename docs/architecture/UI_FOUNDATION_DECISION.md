# Abren ERP: UI Foundation Architecture Decision

_An architectural decision record evaluating UI Primitive libraries and building the foundation for our proprietary, heavily-customizable Vue 3 ERP._

---

## 1. Executive Summary

Building a custom design system for **Abren ERP** requires selecting a foundational "primitives" library. This gives us world-class accessibility (W3C ARIA, keyboard navigation) without locking us into a vendor's visual design or CSS framework.

The three primary contenders for a modern Vue 3 application are:

1. **Reka UI** (formerly Radix Vue)
2. **shadcn-vue** (A CLI tool built _on top of_ Reka UI)
3. **Ark UI** (A framework-agnostic state machine library)

**Recommendation:** Abren ERP utilizes the **shadcn-vue** workflow.

This is not a choice _against_ Reka UI, because shadcn-vue **is** Reka UI. By using shadcn-vue, we get the unstyled, accessible primitives of Reka UI, but we drastically accelerate development by having completely pre-styled, copy-pasteable Tailwind CSS components injected directly into `src/core/ui/`.

This provides the **speed of a UI library** with the **absolute code ownership of a custom design system**.

---

## 2. In-Depth Evaluation

### 2.1 Reka UI (formerly Radix Vue)

🔗 [reka-ui.com](https://reka-ui.com)

Reka UI is the official, independent port of the legendary Radix Primitives for Vue. It provides unstyled, highly accessible UI components (Select, Dialog, Dropdown, Accordion) built entirely from scratch using the Vue 3 Composition API.

- **How it works:** You install `reka-ui`, import `<SelectRoot>`, `<SelectTrigger>`, and `<SelectPortal>`, and wrap them around your own HTML.
- **Pros:**
  - 100% control over the DOM.
  - You aren't fighting a framework's generic CSS.
  - Unbeatable accessibility (focus traps, screen readers).
  - Extremely idiomatic to Vue (uses Vue `ref`s and `provide/inject` natively).
- **Cons:**
  - You start with raw, invisible HTML elements.
  - You must manually write every single Tailwind class for hovering, focus rings, disabled states, and dark mode for _every_ component. In an ERP with 50+ basic components, this is a massive upfront time sink.

### 2.2 shadcn-vue

🔗 [shadcn-vue.com](https://www.shadcn-vue.com)

shadcn-vue is a tremendously popular pattern (originally popular in React as `shadcn/ui`) ported to Vue. It is **not** a component library that you install via `npm install`. It is a CLI tool.

- **How it works:** You run a command like `npx shadcn-vue@latest add button`. The CLI downloads `Button.vue`, fully styled with Tailwind CSS, and physically saves it into your `src/core/ui/` folder. This component internally imports `Reka UI` for accessibility.
- **Pros:**
  - **Zero Vendor Lock-in:** You physically own the `.vue` file. There is no `node_modules/shadcn-vue` to update and break your app. If you need a custom ERP feature in a dropdown, you just edit your local `core/ui/Dropdown.vue`.
  - **Massive Time-Saver:** You get an enterprise-grade, beautifully styled component immediately, saving weeks of writing focus-states in Tailwind.
  - **Ecosystem Synergy:** Integrates natively with `@tanstack/zod-form-adapter`, Reka UI, and Tailwind CSS.
- **Cons:**
  - You inherit their initial design opinions (which are excellent, but you will need to map them slightly to our new `@theme` tokens in `main.css`).
  - Creates slightly more boilerplate in your `core/ui` folder, but this is intentional (ownership over abstraction).

### 2.3 Ark UI

🔗 [ark-ui.com](https://ark-ui.com)

Built by the Chakra UI team, Ark UI uses Zag.js—a framework-agnostic state machine library. It provides headless components for React, Vue, and Solid simultaneously.

- **How it works:** You install `@ark-ui/vue` and use their highly structural components which wire up Zag.js state machines to the DOM via `v-bind`.
- **Pros:**
  - Framework agnostic. If you ever rewrite Abren ERP in SolidJS or React, the mental models transfer perfectly.
  - Incredibly robust and pure state management (state machines prevent impossible UI states).
- **Cons:**
  - It doesn't always feel "Vue-native." Because it uses Zag.js state machines rather than standard Vue Reactivity underneath, the DX (Developer Experience) can feel slightly foreign to Vue developers.
  - Abstraction is heavier than Reka UI.

### 2.4 Headless UI (Tailwind Labs)

🔗 [headlessui.com](https://headlessui.com)

- **Verdict:** Do not use. While popular in React, the Vue version is notoriously neglected. It lacks modern components (like complex Data Tables, Comboboxes, and deep form integrations) required by an ERP.

---

## 3. Comparison Matrix

| Feature                    | Reka UI (Raw)  | shadcn-vue (Reka Engine)  | Ark UI         | PrimeVue Base        |
| :------------------------- | :------------- | :------------------------ | :------------- | :------------------- |
| **Accessibility (W3C)**    | Excellent      | Excellent                 | Excellent      | Good                 |
| **Speed to Market**        | Slow           | **Fastest**               | Slow           | Fast                 |
| **Vue DX Idiomatics**      | ⭐️⭐️⭐️⭐️⭐️     | ⭐️⭐️⭐️⭐️⭐️                | ⭐️⭐️⭐️         | ⭐️⭐️⭐️⭐️             |
| **Vendor Lock-in**         | Low (Headless) | **None (Owned Code)**     | Low (Headless) | High (Walled Garden) |
| **Styling Setup Required** | 100% Manual    | **Pre-styled (Tailwind)** | 100% Manual    | Overrides required   |
| **Form/Zod Synergy**       | Manual wiring  | **Native integrations**   | Manual wiring  | Complex/Foreign      |

---

## 4. Architectural Fit for Abren ERP

An ERP system has hundreds of forms, complex data grids, and dense interfaces. Given the tight deadlines and the need for a hyper-premium look, starting completely from scratch with pure Reka UI will burn weeks of your time just writing CSS for simple focus outlines.

Conversely, using a heavy framework like PrimeVue locks you into their DOM structure, making custom ERP workflows nearly impossible to hack into their components down the road.

**shadcn-vue sits precisely in the middle: The Golden Path.**

1. **The Core UI Layer (`src/core/ui/`):** We use the shadcn-vue CLI to scaffold our primitives (`Button`, `Input`, `Select`, `Dialog`).
2. **The Styling Layer (`main.css`):** The generated components are already wired to use CSS Variables. We simply map these variables to our newly created Tailwind v4 `@theme` design tokens.
3. **The Business Components (`modules/.../components/`):** We import our owned `core/ui/Button.vue` to compose complex interfaces like `PaymentRequestForm.vue`.

### 4.1 Tailwind v4 Compatibility Note

shadcn-vue was historically built for Tailwind v3 (using `tailwind.config.js`). Since Abren ERP is strictly on the bleeding-edge **Tailwind v4** (`@theme` in CSS), we bypass the automated shadcn CLI setup for Tailwind, and simply run the component scaffolding (`add component`) while letting it consume our native v4 `@theme` variables initialized in `main.css`.
