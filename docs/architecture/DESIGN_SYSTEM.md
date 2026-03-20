# Abren ERP: Design System Specification

*The definitive source of truth for visual tokens, typography, and spacing used across the Abren ERP UI.*

This document strictly reflects the design tokens implemented via **Tailwind CSS v4 `@theme`** in `src/assets/main.css`. All custom components built in `src/core/ui/` must adhere exclusively to these tokens.

---

## 1. Color System

We use a heavily curated palette designed for maximum legibility in dense, data-heavy ERP environments. We avoid pure grays, preferring a cool slate under-tone for neutrals, and professional, energetic sky-blues for brand interactions.

### 1.1 Brand Scale (Primary)
Used for primary actions, active states, and focus rings.

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--color-primary-50` | `#f0f9ff` | Subtle background (e.g., active table row) |
| `--color-primary-100` | `#e0f2fe` | Light component background |
| `--color-primary-500` | `#0ea5e9` | **Base Primary Brand Color** |
| `--color-primary-600` | `#0284c7` | Primary Action Hover State |
| `--color-primary-900` | `#0c4a6e` | Deep brand contrast (headers) |

### 1.2 Neutral Scale (Surfaces & Text)
Used for text hierarchy, borders, and UI skeleton backgrounds.

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--color-neutral-50` | `#f9fafb` | Default application background |
| `--color-neutral-100` | `#f3f4f6` | Secondary background (Sidebar, Cards) |
| `--color-neutral-200` | `#e5e7eb` | Subtle borders, dividers |
| `--color-neutral-400` | `#9ca3af` | Disabled text, placeholders |
| `--color-neutral-600` | `#4b5563` | Secondary text (metadata, subtitles) |
| `--color-neutral-900` | `#111827` | Primary text (Headings, dense body) |

### 1.3 Semantic Colors
Used specifically for validation, state, and financial indicators.

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--color-success-500` | `#10b981` | Approved, Paid, Successful operations |
| `--color-warning-500` | `#f59e0b` | Drafts, Pending Action, Warnings |
| `--color-danger-500` | `#ef4444` | Rejected, Errors, Destructive Actions |
| `--color-info-500` | `#3b82f6` | Informational callouts (Non-critical) |

---

## 2. Typography

The ERP uses a clean, highly legible font stack optimized for numeric data and dense tables.

### 2.1 Font Families
* **Sans-serif (`--font-sans`):** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  * Used for 98% of the application (headers, body text, buttons).
* **Monospace (`--font-mono`):** `'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace`
  * Used for code snippets, UUIDs, and specific financial/ledger tables.

### 2.2 Text Scale
| Token | REM | PX Equivalent | Target Usage |
| :--- | :--- | :--- | :--- |
| `--text-xs` | `0.75rem` | 12px | Badges, tiny tooltips, meta data |
| `--text-sm` | `0.875rem`| 14px | Table cells, secondary navigation |
| `--text-base` | `1rem` | 16px | **Default body text**, Inputs |
| `--text-lg` | `1.125rem`| 18px | Card headers, sub-sections |
| `--text-2xl` | `1.5rem` | 24px | Page titles (`h2`) |
| `--text-4xl` | `2.25rem`| 36px | Hero statistics, empty state titles |

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

### 3.2 Border Radius
| Token | REM | PX | Usage |
| :--- | :--- | :--- | :--- |
| `--radius-sm` | `0.25rem`| 4px | Checkboxes, small badges |
| `--radius-md` | `0.5rem` | 8px | Standard inputs, select boxes, buttons |
| `--radius-lg` | `0.75rem`| 12px | Modals, cards, dropdown menus |

---

## 4. Elevation (Shadows & Z-Index)

Elevation is used to create visual hierarchy, particularly for floating elements (modals, dropdowns) over data grids.

### 4.1 Drop Shadows
* `--shadow-sm`: Soft border definition for basic interactive elements (buttons).
* `--shadow-md`: Hover states for cards.
* `--shadow-lg`: Dropdown menus, tooltips, and popovers.
* `--shadow-xl`: Modal dialogs and critical full-screen overlays.

### 4.2 Z-Index Scale
* `--z-dropdown` (`1000`): Standard floating menus and selects.
* `--z-modal` (`1050`): Dialog boxes.
* `--z-overlay` (`1100`): Full-screen loading states or critical blocking alerts.

---

## 5. Primitive Components (`core/ui/`)

All base UI components (`AppButton`, `AppInput`, `AppSelect`, etc.) are physically owned in `src/core/ui/` and strictly utilize the tokens above.

* **Base Tech:** Reka UI (accessible DOM primitives)
* **Scaffolding:** shadcn-vue CLI
* **Styling Framework:** Tailwind CSS v4 `@theme`

*No external vendor libraries (like PrimeVue) are permitted for these primitives, guaranteeing full long-term code ownership.*
