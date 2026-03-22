# Abren ERP: Design System Specification

*The definitive source of truth for visual tokens, typography, and spacing used across the Abren ERP UI.*

This document strictly reflects the design tokens implemented via **Tailwind CSS v4 `@theme`** in `src/assets/main.css`. All custom components built in `src/core/ui/` must adhere exclusively to these tokens.

---

## 1. Aesthetic Principles

To ensure Abren ERP feels like a state-of-the-art financial platform, we adhere to the following premium design pillars:

*   **Operational Density First**: Maximize information per viewport. Avoid wasted whitespace. Every pixel must justify itself. We natively support a **3-tier density system** (Compact by default, Comfortable, Touch).
*   **Vibrant Professionalism**: We avoid muddy grays. Our neutrals use a premium **Radix Slate** (warm blue-gray) base, and our primary actions use authoritative **Indigo** to draw the eye without creating fatigue or conflicting with financial status colors.
*   **Keyboard-First UX**: Power users must be able to operate the ERP without a mouse. Tables behave like spreadsheets, and a global Command Palette (⌘K) provides instant access to all modules and actions.
*   **Speed Over Decoration**: The UI must feel instant. We avoid heavy animations in favor of micro-interactions (< 100ms) that provide immediate tactile feedback.

---

## 2. Color System

We use a heavily curated palette designed for maximum legibility in dense, data-heavy ERP environments. 

> **CRITICAL RULE**: Color is **functional, not decorative**. Never use color for layout separation (use borders). Primary colors are reserved strictly for actions and active states. Semantic colors (Emerald/Red) are reserved strictly for status. NEVER hardcode hex values in components.

### 2.1 Brand Scale (Indigo)
Used for primary actions, active states, and focus rings. We use Indigo (`#4f46e5`) because it reads as authoritative and precise for finance, and crucially, does not conflict with the Emerald/Green used for positive financial amounts and success states.

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--color-primary-50` | `#eef2ff` | Subtle background (e.g., active table row) |
| `--color-primary-100` | `#e0e7ff` | Light component background |
| `--color-primary-500` | `#6366f1` | Brand accents |
| `--color-primary-600` | `#4f46e5` | **Base Primary Action Color** |
| `--color-primary-700` | `#4338ca` | Primary Action Hover State |

### 2.2 Neutral Scale (Radix Slate)
Used for text hierarchy, borders, and UI skeleton backgrounds. Replacing Tailwind's cold gray, we use Radix Slate for a premium, warmer blue-gray that reduces eye strain at high information density.

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--color-neutral-50` | `#f8fafc` | Default application background |
| `--color-neutral-100` | `#f1f5f9` | Secondary background (Sidebar, Cards) |
| `--color-neutral-200` | `#e2e8f0` | Subtle borders, dividers |
| `--color-neutral-400` | `#94a3b8` | Disabled text, placeholders |
| `--color-neutral-500` | `#64748b` | Muted secondary text |
| `--color-neutral-900` | `#0f172a` | Primary text (Headings, dense body) |

### 2.3 Semantic Colors
Used specifically for validation, state, and financial indicators. We deploy full 50–700 scales for these to allow for tinted alert backgrounds.

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--color-success-500` | `#10b981` | (Emerald) Approved, Paid, Positive amounts |
| `--color-warning-500` | `#f59e0b` | (Amber) Drafts, Pending Action, Warnings |
| `--color-danger-500` | `#ef4444` | (Red) Rejected, Errors, Negative amounts |
| `--color-info-500` | `#3b82f6` | (Blue) Informational callouts (Non-critical) |

### 2.4 Data Visualization Palette (IBM Carbon)
ERP dashboards and charts require a distinct, colorblind-safe categorical palette. We adopt the mathematically rigorous 8-color IBM Carbon data palette.

* `--chart-1`: `#6929c4` (Purple)
* `--chart-2`: `#1192e8` (Cyan)
* `--chart-3`: `#005d5d` (Teal)
* `--chart-4`: `#9f1853` (Magenta)
* `--chart-5`: `#fa4d56` (Red)
* `--chart-6`: `#570408` (Dark Red)
* `--chart-7`: `#198038` (Green)
* `--chart-8`: `#002d9c` (Blue)

---

## 2. Typography

The ERP uses a clean, highly legible font stack optimized for numeric data and dense tables.

### 2.1 Font Families
* **Sans-serif (`--font-sans`):** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  * Used for 98% of the application (headers, body text, buttons).
* **Monospace (`--font-mono`):** `'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace`
  * Used for code snippets, UUIDs, and specific financial/ledger tables.

### 3.2 Semantic Text Scale
Components must reference **semantic role tokens**, not raw pixel sizes.

| Token | CSS Target | Target Usage |
| :--- | :--- | :--- |
| `--text-display`  | `32px 700 -0.02em` | Page hero stats, empty state titles |
| `--text-heading`  | `24px 700 -0.01em` | Module headings |
| `--text-title`    | `18px 600 0`       | Section / panel headings |
| `--text-body`     | `14px 400 0`       | **Default body text**, Inputs |
| `--text-body-sm`  | `13px 400 0`       | Secondary body text |
| `--text-label`    | `11px 600 +0.04em` | Table headers (ALL CAPS) |
| `--text-code`     | `12.5px 400 0`     | IDs, ledger codes, financial amounts |
| `--text-micro`    | `11px 400 +0.02em` | Timestamps, metadata |

---

## 3. Spacing & Radius

Consistency in spacing prevents the UI from feeling disjointed. Never use arbitrary pixel pushing (e.g., `margin-top: 13px`).

### 3.1 Spacing Scale
| Token | REM | PX | Usage |
| :--- | :--- | :--- | :--- |
| `--spacing-xs` | `0.25rem`| 4px | Component internal padding (e.g., checkbox to label) |
| `--spacing-sm` | `0.5rem` | 8px | Button padding, list item gaps |
| `--spacing-md` | `1rem` | 16px | Standard gap between form fields, default container padding |
| `--spacing-lg` | `1.5rem` | 24px | Distance between major page sections |
| `--spacing-xl` | `2rem` | 32px | Page margins |

### 4.2 Border Radius
| Token | REM | PX | Usage |
| :--- | :--- | :--- | :--- |
| `--radius-sm` | `0.25rem`| 4px | Checkboxes, small badges |
| `--radius-md` | `0.375rem`| 6px | Standard inputs, select boxes, buttons |
| `--radius-lg` | `0.5rem` | 8px | Modals, cards, dropdown menus |
| `--radius-xl` | `0.75rem`| 12px | Large structural containers |

---

## 5. Density System

Abren ERP operates on a 3-tier density scale. The default is **Compact** to serve power users viewing large financial grids.

| Mode | Target User | Base Font | Row Height | Input Height |
|---|---|---|---|---|
| **Compact (Default)** | Data entry, accountants | 12.5–13px | 30px | 28px |
| **Comfortable** | Casual users, managers | 14px | 40px | 36px |
| **Touch** | Mobile / tablet field logic | 16px | 48px | 44px |

*Density modes will be exposed via a `data-density` attribute on the `<html>` element.*

---

## 6. Elevation (Shadows & Layered Surfaces)

Elevation is used to create visual hierarchy. In an ERP, excessive drop shadows appear cluttered. 

### 6.1 Layered Surfaces Strategy
Instead of relying solely on heavy shadows, we use **layered surfaces**—especially critical in Dark Mode.
*   **Base (Level 0)**: The application background (`--color-neutral-50` / `#0d1117` dark).
*   **Elevated (Level 1)**: Cards, Sidebars, and Drawers (`#ffffff` / `#161d28` dark).
*   **Floating (Level 2)**: Modals and Dropdowns (`#ffffff` / `#1e293b` dark + shadow).

### 6.2 Drop Shadows
Shadows have a dual-layer softness to match the Radix Slate tone and are applied only to elevated/floating layers.
* `--shadow-sm`: Soft border definition for basic interactive elements (buttons).
* `--shadow-md`: Hover states for cards.
* `--shadow-lg`: Dropdown menus, tooltips, and popovers.
* `--shadow-xl`: Modal dialogs and critical full-screen overlays.

### 6.2 Z-Index Scale
* `--z-dropdown` (`1000`): Standard floating menus and selects.
* `--z-modal` (`1050`): Dialog boxes.
* `--z-overlay` (`1100`): Full-screen loading states or critical blocking alerts.

---

## 7. ERP Interaction Patterns

### 7.1 Command Palette (⌘K)
A global Command Palette is required. It provides power users instant keyboard access to jump to any module, search any entity ID, or initiate global actions (e.g., "Create Journal Entry") without touching the mouse.

### 7.2 Context Preservation (Drawers)
For editing records in a dense grid context, prefer **slide-out Drawers** over new page navigations. This preserves the user's scroll position and applied filters in the background grid.

### 7.3 Destructive Confirmations
Any action that deletes a record or irrevocably alters a ledger state must trigger a blocking **AlertDialog** (using Radix Vue primitives). The dialog must force the user to explicitly click an Indigo or Red confirmation button. Passive "Are you sure?" tooltips are insufficient for destructive financial actions.

---

## 8. Responsive Strategy (Mobile Graceful Degradation)

Abren ERP is a desktop-first operational console. Attempting full feature parity on mobile devices breaks high-density data requirements. We enforce strict graceful degradation:

*   **Desktop (≥ 1024px)**: Full feature parity. Complex grids, drawer-based editing, multi-column reporting.
*   **Tablet (768px – 1023px)**: Reduced parity. The left navigation rail collapses aggressively, and secondary grid columns are hidden by default. Let users rotate to landscape for wider grids.
*   **Mobile (< 768px)**: We **do not** render data grids on phones. Mobile views are restricted strictly to read-only KPI dashboards, simple list feeds, and basic approval workflows (e.g., "Approve PO"). Always prioritize speed over complexity on mobile.

---

## 8. Core Enterprise UX Architecture

Based on enterprise software best practices (adapting successful patterns from platforms like Microsoft Dynamics 365 while discarding their consumer bloat), Abren ERP rigidly enforces the following structural layouts:

### 8.1 The Consistent Left-Hand Navigation Rail
Unlike legacy top-ribbon interfaces, we utilize a collapsible left-hand navigation rail.
*   **Dimensions:** `220px` expanded, `64px` collapsed (icon-only).
*   **Behavior:** Must be toggleable via keyboard shortcut (e.g., `⌘ + \`) to instantly yield horizontal space back to dense data grids.

### 8.2 Progressive Disclosure (Context Drawers)
We reject "all-fields-on-one-screen" forms. Editing or creating complex records relies on Progressive Disclosure.
*   **Implementation:** Use right-aligned **Context Drawers** (`DataGridDrawer.vue`).
*   **Tabs:** Information within the drawer must be segmented (e.g., "Summary" tab, "Audit Log" tab) so users only see fields relevant to their immediate task.

---

## 9. Explicitly Rejected Patterns (The "Anti-Patterns")

To maintain high operational density and avoid the pitfalls of generalized "consumer-friendly" SaaS design, the following UX defaults are **strictly banned** in Abren ERP:

*   **🚫 Consumer-Grade Size Metrics**: UI libraries (including generalized Fluent / Tailwind defaults) ship with massive `40px` tap targets. These are forbidden in Abren ERP. We strictly enforce our **Compact Mode** (30px row height).
*   **🚫 Hidden Contextual Commands ("..." Menus)**: Primary grid actions (Edit, Delete, Export) must not be buried inside overflow ellipses menus just to make the UI look "cleaner." Use native Right-Click context menus or expose icons on hover.
*   **🚫 "Wizard" Flows for Basic Entry**: Power users despise paginated wizards because they break flow state. Use single-view Drawers or inline grid editors. Save wizards exclusively for rare, complex configurations (e.g., Year-End Close).
*   **🚫 Blinding `#FFFFFF` Backgrounds**: Staring at pure white canvases for 8 hours causes optical fatigue. Always use the Radix Slate token (`--color-neutral-50` / `#f8fafc`) as the base application background.

---

## 10. Localization & Finance Readiness

The UI layer must remain isolated from hardcoded currency symbols or date formats.
*   **Multi-currency Support**: All amounts must be formatted via `Intl.NumberFormat` supporting ETB, USD, etc.
*   **Font Readiness**: `--font-sans` must support required glyphs for future expansion into local languages (e.g., **Amharic**).

---

## 11. Primitive Components (`core/ui/`)

All base UI components (`AppButton`, `AppInput`, `AppSelect`, etc.) are physically owned in `src/core/ui/` and strictly utilize the tokens above.

* **Base Tech:** Radix Vue (accessible DOM primitives via `radix-vue`)
* **Scaffolding:** shadcn-vue CLI
* **Styling Framework:** Tailwind CSS v4 `@theme`

*No external vendor libraries (like PrimeVue) are permitted for these primitives, guaranteeing full long-term code ownership.*
