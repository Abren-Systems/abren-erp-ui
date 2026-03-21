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

* **Virtualized rendering** (mandatory beyond ~100 rows)
* **Column-driven architecture** (not row-driven)
* **Stateful grid** (user preferences persist)

---

# 2. 📏 DIMENSIONS (COMPACT MODE — DEFAULT)

## 2.1 Row & Cell Metrics

```text
Row height:        30px
Header height:     30px
Cell padding:      6px 8px
Font size:         12.5px
Line height:       1.3
```

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

| State    | Style               |
| -------- | ------------------- |
| Default  | Transparent         |
| Hover    | `#111827`           |
| Selected | subtle emerald tint |
| Editing  | bordered highlight  |

---

## 3.2 Borders (CRITICAL)

```text
Row divider:      #1B2433
Column divider:   #1F2937
Header border:    #273244
```

👉 Without this → dense UI becomes unreadable

---

## 3.3 Text Rules

* Left align → text
* Right align → numbers
* Center → status/icons

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

* Resize (drag edge)
* Reorder (drag header)
* Show/hide (column menu)
* Pin left/right
* Sort (single + multi)

---

# 5. ⚡ INTERACTION MODEL (POWER USER FIRST)

## 5.1 Keyboard Navigation

| Key    | Action      |
| ------ | ----------- |
| ↑ ↓    | Move rows   |
| ← →    | Move cells  |
| TAB    | Next cell   |
| ENTER  | Edit cell   |
| ESC    | Cancel edit |
| CTRL+C | Copy        |
| CTRL+V | Paste       |

👉 This is non-negotiable for ERP usability

---

## 5.2 Mouse Interaction

* Single click → select cell
* Double click → edit
* Drag → multi-select
* Right click → context menu

---

# 6. ✏️ INLINE EDITING SYSTEM

## 6.1 Editing Modes

### Cell Mode (default)

* Edit one cell at a time

### Row Mode (optional)

* Edit full row

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

* Enter → save + move down
* Tab → save + move right
* Immediate validation feedback
* No full page reloads

---

# 7. 🔍 FILTERING SYSTEM

## 7.1 Levels

### Global Search

* Top toolbar
* Searches across columns

### Column Filters

* Per column
* Type-specific:

  * Text → contains
  * Number → range
  * Date → range

---

## 7.2 Saved Views (CRITICAL FEATURE)

Users can save:

* Filters
* Column visibility
* Sorting
* Grouping

👉 This is a **major ERP differentiator**

---

# 8. 📦 BULK OPERATIONS

## 8.1 Selection

* Checkbox column (left)
* Shift-click range selection
* “Select all” (with server awareness)

---

## 8.2 Bulk Actions

* Delete
* Update field
* Export
* Approve / Reject

---

# 9. 📊 DATA STATES

## 9.1 Loading

* Skeleton rows (NOT spinner)

## 9.2 Empty

```text
"No records found"
[ Create New ]
```

## 9.3 Error

* Inline error row or banner

---

# 10. 📌 PINNING & FREEZING

## Required:

* First column pinned (ID or name)
* Optional right pin (actions)

---

# 11. 📉 PERFORMANCE MODEL

## Must Handle:

* 10,000+ rows
* 50+ columns

## Techniques:

* Virtual scrolling
* Memoized cells
* Server-side filtering/sorting

---

# 12. 🧾 FOOTER SYSTEM

Optional but recommended:

* Totals (sum, avg)
* Record count
* Pagination (if not infinite scroll)

---

# 13. 🧠 ADVANCED FEATURES (PHASE 2)

## Grouping

* Group by column
* Collapsible rows

## Aggregations

* Sum / Avg per group

## Inline Row Creation

* “+ New Row” at top

## Audit Indicators

* Edited cells highlighted

---

# 14. 🎯 UX MICRO-DETAILS (THIS IS WHERE YOU WIN)

* Hover delay: **0ms**
* Resize feedback: live
* Drag preview: subtle
* No flicker on scroll
* Preserve scroll position on update

---

# 15. 🧰 IMPLEMENTATION MAPPING (VUE)

## Recommended Stack

* TanStack Table (core logic)
* Vue 3 (Composition API)
* Virtualizer (TanStack Virtual)

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



