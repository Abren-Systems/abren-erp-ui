# 🧾 ABREN ERP — DATA GRID SPEC (v1.0)

---

# 1. 🧱 GRID ARCHITECTURE

## 1.1 Layout Anatomy

```text
┌──────────────────────────────────────────────┐
│ Toolbar (filters, actions, views)            │  ← 40px
├──────────────────────────────────────────────┤
│ Column Headers (sticky)                      │  ← 30px
├──────────────────────────────────────────────┤
│ Data Rows (virtualized scroll)               │
│                                              │
│                                              │
└──────────────────────────────────────────────┘
│ Footer (optional: totals, pagination)        │  ← 32px
```

---

## 1.2 Core Principles

- **Virtualized rendering** (mandatory beyond ~100 rows)
- **Column-driven architecture** (not row-driven)
- **Stateful grid** (user preferences persist)

---

# 2. 📏 DIMENSIONS (COMPACT MODE — DEFAULT)

## 2.1 Row & Cell Metrics

We adhere to the **3-tier density system** defined in `DESIGN_SYSTEM.md`. The grid defaults to **Compact** mode for ERP power users.

| Metric        | Compact (Default) | Comfortable | Touch     |
| ------------- | ----------------- | ----------- | --------- |
| Row Height    | 30px              | 40px        | 48px      |
| Header Height | 30px              | 40px        | 48px      |
| Cell Padding  | 6px 8px           | 8px 12px    | 12px 16px |
| Font Size     | 12.5px            | 13px        | 14px      |
| Line Height   | 1.3               | 1.4         | 1.5       |

---

## 2.2 Column Width Rules

| Type        | Width  |
| ----------- | ------ |
| Checkbox    | 36px   |
| ID          | 80px   |
| Short text  | 120px  |
| Medium text | 180px  |
| Long text   | 240px+ |
| Numeric     | 100px  |
| Currency    | 120px  |
| Date        | 140px  |
| Actions     | 100px  |

👉 All columns must be **resizable**

---

# 3. 🎨 VISUAL SYSTEM (DENSE + CLEAR)

## 3.1 Row Styling

| State    | Token                           |
| -------- | ------------------------------- |
| Default  | `--color-grid-bg`               |
| Hover    | `--color-grid-row-hover`        |
| Selected | `--color-grid-row-selected`     |
| Editing  | primary-tinted border highlight |

---

## 3.4 Theming Strategy (CRITICAL)

The grid does **NOT** have a fixed dark or light appearance. It follows the design system:

- `--color-grid-*` tokens default to **light mode** (neutral palette)
- Adding `class="dark"` to `<html>` activates dark overrides
- `@media (prefers-color-scheme: dark)` activates dark overrides for system preference
- `class="light"` on `<html>` forces light mode even on dark-system machines

> **Rule**: Never hardcode `#hex` values directly in component styles. Always reference `--color-grid-*` tokens.

---

## 3.2 Borders (CRITICAL)

```text
Row divider:      --color-grid-divider
Column divider:   --color-grid-col-divider
Header border:    --color-grid-header-border
```

👉 Token values come from the design system. Light/dark resolved at runtime.

---

## 3.3 Text Rules

- Left align → text
- Right align → numbers
- Center → status/icons

---

# 4. 🧠 COLUMN SYSTEM

## 4.1 Column Definition Model

Each column must support:

```ts id="8ngs0l"
{
  id: string
  label: string
  type: "text" | "number" | "currency" | "date" | "status"
  width: number
  minWidth: number
  maxWidth?: number
  sortable: boolean
  filterable: boolean
  editable: boolean
  pinned?: "left" | "right"
}
```

---

## 4.2 Column Features (Mandatory)

- Resize (drag edge)
- Reorder (drag header)
- Show/hide (column menu)
- Pin left/right
- Sort (single + multi)

---

# 5. ⚡ INTERACTION MODEL (POWER USER FIRST)

## 5.1 Keyboard Navigation

| Key         | Action                                                                        |
| ----------- | ----------------------------------------------------------------------------- |
| ↑ ↓         | Move rows                                                                     |
| ← →         | Move cells                                                                    |
| TAB         | Next cell                                                                     |
| ENTER       | Edit cell (or open Drawer)                                                    |
| ESC         | Cancel edit                                                                   |
| ⌘K / Ctrl+K | **Command Palette** (Scopes immediately to bulk actions if rows are selected) |
| CTRL+C      | Copy                                                                          |
| CTRL+V      | Paste                                                                         |

👉 This is non-negotiable for ERP usability. The **Command Palette (⌘K)** specifically must intercept standard typing to provide instant filtering or bulk action dispatching on selected rows.

---

## 5.2 Mouse Interaction

- Single click → select cell
- Double click → edit
- Drag → multi-select
- Right click → context menu

---

# 6. ✏️ INLINE EDITING SYSTEM

## 6.1 Editing Modes

### Cell Mode (Fastest)

- Edit one cell at a time directly inline.
- Best for rapid data entry (e.g., updating statuses or amounts).

### Drawer Mode (Context-Preserving)

- Slide-out panel from the right edge (40-50% width).
- Best for complex records.
- **Smart Buttons:** The top of the drawer should feature a row of `DataGridSmartButton` components displaying relational KPIs (e.g., "4 Invoices") that navigate and filter target grids on click.
- **Never use full page reloads or center modals** for grid record editing, as they destroy the user's filtered background context.

---

## 6.2 Input Types

| Column Type | Input           |
| ----------- | --------------- |
| Text        | Text input      |
| Number      | Numeric input   |
| Currency    | Formatted input |
| Date        | Date picker     |
| Status      | Dropdown        |

---

## 6.3 Editing UX Rules

- Enter → save + move down
- Tab → save + move right
- Immediate validation feedback
- No full page reloads

---

# 7. 🔍 FILTERING SYSTEM

## 7.1 Levels

### Global Search (Omni-bar)

- Top toolbar
- Functions as an **Omni-Search**: Parses structural intent (e.g., converting "Status: Active" into a hard column filter) alongside cross-column text matching.

### Column Filters

- Per column
- Type-specific:
  - Text → contains
  - Number → range
  - Date → range

---

## 7.2 Saved Views (CRITICAL FEATURE)

Users can save:

- Filters
- Column visibility
- Sorting
- Grouping

👉 This is a **major ERP differentiator**

---

# 8. 📦 BULK OPERATIONS

## 8.1 Selection

- Checkbox column (left)
- Shift-click range selection
- “Select all” (with server awareness)

---

## 8.2 Bulk Actions

- Delete
- Update field
- Export
- Approve / Reject

---

# 9. 📊 DATA STATES

## 9.1 Loading

- Skeleton rows (NOT spinner)

## 9.2 Empty

```text
"No records found"
[ Create New ]
```

## 9.3 Error

- Inline error row or banner

---

# 10. 📌 PINNING & FREEZING

## Required:

- First column pinned (ID or name)
- Optional right pin (actions)

---

# 11. 📉 PERFORMANCE MODEL

## Must Handle:

- 10,000+ rows
- 50+ columns

## Techniques:

- Virtual scrolling
- Memoized cells
- Server-side filtering/sorting

---

# 12. 🧾 FOOTER SYSTEM

Optional but recommended:

- Totals (sum, avg)
- Record count
- Pagination (if not infinite scroll)

---

# 13. 🧠 ADVANCED FEATURES (PHASE 2)

## Grouping

- Group by column
- Collapsible rows

## Aggregations

- Sum / Avg per group

## Inline Row Creation

- “+ New Row” at top

## Audit Indicators

- Edited cells highlighted

---

# 14. 🎯 UX MICRO-DETAILS (THIS IS WHERE YOU WIN)

- Hover delay: **0ms**
- Resize feedback: live
- Drag preview: subtle
- No flicker on scroll
- Preserve scroll position on update

---

# 15. 🧰 IMPLEMENTATION MAPPING (VUE)

## Recommended Stack

- TanStack Table (core logic)
- Vue 3 (Composition API)
- Virtualizer (TanStack Virtual)

---

## Component Structure

```text
DataGrid/
├── DataGrid.vue
├── GridHeader.vue
├── GridRow.vue
├── GridCell.vue
├── GridToolbar.vue
├── ColumnMenu.vue
├── Filters/
├── Editors/
```

---

# 16. 📐 TYPESCRIPT CONTRACT

## 16.1 Full ColumnDef Interface

```ts
export interface GridColumnDef<TData> {
  /** Unique column id, maps to TanStack Table accessorKey */
  id: string
  accessorKey: keyof TData | string
  label: string
  /** Controls cell renderer + inline editor selection */
  type: 'text' | 'number' | 'currency' | 'date' | 'status' | 'badge'
  /** Pixel width. Defaults per §2.2 */
  width?: number
  minWidth?: number
  maxWidth?: number
  /** Text alignment override. Defaults: text→left, number/currency→right, status→center */
  align?: 'left' | 'right' | 'center'
  sortable?: boolean
  filterable?: boolean
  editable?: boolean
  pinned?: 'left' | 'right'
  /** Accessor for display value. If omitted, raw value is used. */
  formatter?: (value: unknown, row: TData) => string
  /** Short label for column menu; falls back to label */
  headerTooltip?: string
  /** If true, inline editor will require a non-empty value */
  required?: boolean
}
```

## 16.2 ColumnType → Renderer Mapping

| type       | Cell Renderer          | Default Width | Alignment |
| ---------- | ---------------------- | ------------- | --------- |
| `text`     | Plain span             | 180px         | left      |
| `number`   | Locale-formatted span  | 100px         | right     |
| `currency` | `Intl` money formatter | 120px         | right     |
| `date`     | `Intl.DateTimeFormat`  | 140px         | left      |
| `status`   | Colored badge          | 100px         | center    |
| `badge`    | Colored pill (enum)    | 120px         | center    |

---

# 17. 🧩 COMPOSABLE ARCHITECTURE

All grid state is owned by the **caller**, not the grid component.
The grid component is a **controlled component** — it emits state changes via `defineModel`.

```ts
// In the page component:
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()
```

## 17.1 useDataGrid() — Returns

| Ref                | Type                      | Purpose                  |
| ------------------ | ------------------------- | ------------------------ |
| `sorting`          | `Ref<SortingState>`       | TanStack sort state      |
| `rowSelection`     | `Ref<RowSelectionState>`  | Selected row IDs         |
| `columnVisibility` | `Ref<VisibilityState>`    | Hidden column IDs        |
| `globalFilter`     | `Ref<string>`             | Search string            |
| `columnFilters`    | `Ref<ColumnFiltersState>` | Per-column filter values |
| `selectedCount()`  | `() => number`            | # of selected rows       |
| `resetAll()`       | `() => void`              | Clear all state          |

## 17.2 DataGrid Prop Bindings (v-model)

```vue
<DataGrid
  :columns="accountColumns"
  :data="data"
  :loading="isPending"
  v-model:sorting="sorting"
  v-model:row-selection="rowSelection"
  v-model:column-visibility="columnVisibility"
  v-model:global-filter="globalFilter"
/>
```

> **Rule**: Column definitions (`accountColumns`) must be defined in the **Grid Configuration Layer** (`ui/grids/account.grid.ts`), NOT inline in the page or component.

---

# 18. 🗂️ FULL COMPONENT TREE (PHASE 1 + 2)

```text
src/shared/components/data-grid/
├── core/
│   ├── DataGrid.vue          ← Main entry point (BUILT)
│   ├── DataGridSkeleton.vue  ← Shimmer loading rows (BUILT)
│   └── DataGridEmpty.vue     ← No-results state (BUILT)
├── plugins/
│   ├── DataGridToolbar.vue       ← Search + actions (BUILT)
│   └── DataGridColumnHeader.vue  ← Sortable header cell (BUILT)
├── index.ts                  ← Public API barrel (BUILT)
│
├── Filters/ [PHASE 2]
│   ├── TextFilter.vue
│   ├── NumberRangeFilter.vue
│   ├── DateRangeFilter.vue
│   └── StatusFilter.vue
│
├── Overlays/ [PHASE 2]
│   ├── DataGridDrawer.vue          ← Right-edge context editor
│   ├── DataGridSmartButton.vue     ← Relational KPI navigation button
│   └── DataGridCommandPalette.vue  ← ⌘K global action overlay
│
└── Editors/ [PHASE 2]
    ├── TextEditor.vue
    ├── NumberEditor.vue
    ├── CurrencyEditor.vue
    ├── DateEditor.vue
    └── StatusEditor.vue


src/shared/composables/
└── useDataGrid.ts            ← State factory (BUILT)

src/modules/{module}/ui/grids/
└── {entity}.grid.ts          ← Column Definitions & Formatters
```

---

# 19. ✏️ EDITING FLOW (PHASE 2)

## Sequence: Cell Activation → Validation → Submit

```
1. User double-clicks cell (or presses ENTER while cell focused)
2. Cell enters EDITING state → mounts the correct Editor component
3. User types / picks value
4. User presses ENTER or TAB → triggers validation (field-level Zod schema)
   - If INVALID → show inline error, remain in EDITING state
   - If VALID   → **0ms Optimistic Update**. Patch the local table data immediately to its "saved" state. **DO NOT** block the UI or show an inline loading spinner.
5. API mutation fires silently in the background
   - On success: nothing to do (already updated)
   - On failure: rollback to original value, show error toast
6. ESC at any point → cancel edit, restore original value
```

## Dirty State Rule

If a row has unsaved changes and the user navigates away, show a confirmation dialog: _"You have unsaved changes. Discard?"_

## OCC / Conflict Resolution

Because the backend uses `version_id` (Optimistic Concurrency Control), a 409 Conflict response means another user saved. Show: _"This record was updated by another user. Reload to see the latest version."_

---

# 20. 💾 SAVED VIEWS (PHASE 2)

## View Schema

```ts
interface GridView {
  id: string
  name: string
  userId: string // personal, or null for shared
  tenantId: string
  filters: ColumnFiltersState
  sorting: SortingState
  columnVisibility: VisibilityState
  globalFilter: string
}
```

## Persistence Layer

- **Phase 2 MVP**: `localStorage` keyed by `gridId + userId`
- **Phase 3**: Server-side (`POST /api/v1/grid-views`) for cross-device sync and sharing

---

# 21. 🖱️ CONTEXT MENU SPEC

Triggered by right-click on a data row.

| Action          | Condition                     |
| --------------- | ----------------------------- |
| Copy row        | Always                        |
| Copy cell       | Always                        |
| Open in new tab | If row has a detail route     |
| Edit            | If row is editable            |
| Delete          | If user has delete permission |

Implementation: Reka UI `ContextMenu` primitive.

---

# 22. 📤 EXPORT SPEC

- **Toolbar button**: "Export" → dropdown: CSV, XLSX
- **Scope**: Current filtered + sorted view (not full table)
- **Implementation**: `export-to-csv` utility function operating on `table.getFilteredRowModel().rows`
- XLSX: Use `xlsx` (SheetJS) only if explicitly requested

---

# 23. ♿ ACCESSIBILITY (a11y)

| Element             | ARIA attribute                                  |
| ------------------- | ----------------------------------------------- | ---------- | ------ |
| `<table>`           | `role="grid"`                                   |
| Sortable `<th>`     | `aria-sort="ascending                           | descending | none"` |
| Selected row `<tr>` | `aria-selected="true"`                          |
| Skeleton `<tbody>`  | `aria-busy="true"`, `aria-label="Loading data"` |
| Toolbar search      | `aria-label="Search records"`                   |

---

# 24. 📱 RESPONSIVE POLICY

The DataGrid is a **desktop-first ERP component**. On narrow viewports:

| Breakpoint   | Behavior                                                 |
| ------------ | -------------------------------------------------------- |
| `≥ 1024px`   | Full grid                                                |
| `768–1023px` | Hide pinned-right columns, collapse actions to icon-only |
| `< 768px`    | Show card list view (not a table) — Phase 3              |
