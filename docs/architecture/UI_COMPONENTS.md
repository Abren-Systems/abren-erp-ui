# Foundation UI Components Guide

This document defines the strict engineering standards for building and utilizing User Interface components within Abren ERP. We leverage the **Fluent Design System** visually, but enforce strict abstraction boundaries programmatically.

## 1. The Wrapper Mandate (Vendor Shielding)

Never import or mount a pristine generic UI component (like `<fluent-button>`) directly inside a business module.

**All fundamental interactive elements must be routed through the `App` abstraction layer.** This ensures we own the reactivity contract and can pivot styling without touching business logic.

### Correct Usage (Business Layer)

```vue
<template>
  <AppButton variant="primary" @click="submitLedger"> Post Entry </AppButton>
</template>

<script setup>
import { AppButton } from '@/shared/components/primitives'
</script>
```

---

## 2. High-Density ERP Standards

Abren ERP is a dense, operational interface. We explicitly deviate from standard web "breathing room" in favor of maximum information throughput.

### 2.1. The 32px Standard

All primary interactive elements (Buttons, Inputs, Selects) must maintain a **fixed height of 32px**. This allows for high-density tabular alignment and predictable vertical scanning.

### 2.2. Sharp Corners

We reject the rounded "consumer" aesthetic. All components must target a **2px corner radius** standard via CSS variables.

---

## 3. Layered Contrast Hierarchy (Canvas vs. Surface)

To create structural depth without heavy shadows, we use a three-tier layout pattern:

1.  **Level 0: The Canvas (`var(--app-canvas)`)**: The pale gray base for all pages.
2.  **Level 1: The Nav Anchor (`var(--app-sidebar)`)**: The slightly deeper gray for stable sidebars.
3.  **Level 2: The Action Surface (`var(--app-surface)`)**: Stark white containers. **All Data Grids and Forms must live on Level 2.**

---

## 4. Engineering with Shadow DOM & Tailwind v4

Abren ERP uses **Tailwind v4** (`@theme`). To style Fluent Web Components, we bridge these two worlds:

### 4.1. Targeting the Shadow root

Direct Tailwind classes on an `<AppButton>` only affect the custom element host. To affect the internal appearance, use **Parts** or **CSS Variables**:

```css
/* Precise internal radius mapping */
.app-button-root {
  --control-corner-radius: 2px;
  --accent-fill-rest: var(--color-primary-600);
}
```

### 4.2. Layout Mapping

Use Tailwind exclusively for **Layout & Spacing** (Flex, Grid, Margin, Padding). Use Fluent tokens exclusively for **Appearance** (Color, Borders, Interaction states).

---

## 5. Supported Primitives (The `App*` suite)

Located in `src/shared/components/primitives/`:

- **`AppButton`**: Action trigger. 32px high.
- **`AppInput`**: Bridges `<fluent-text-field>`. Fixed 32px height.
- **`AppSelect`**: Ensures strict nullable parsing for parent-child hierarchies.
- **`AppBadge`**: Status indicators (Draft, Posted, Voided). Uses semantic tints.
- **`AppDrawer`**: Contextual overlays for the "Provenance" stage of UX.

---

## 6. The Data Grid Exception

**TanStack Table** handles structural manipulation of our grids. **Do not use `<fluent-data-grid>`**. The `DataGrid.vue` wrapper acts as the headless host. You must implement cell definitions using `App*` primitives to maintain Vue reactivity across the table rows.
