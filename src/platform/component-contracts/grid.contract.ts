import type { FieldContract } from './field.contract'

// ── Grid Contracts ─────────────────────────────────────────────────────────
// Pure data definitions for tables, inquiries, and child collections.
// These govern how `DataGrid` renders.

export interface GridColumnContract {
  readonly id: string
  readonly field: FieldContract // The underlying field definition for formatting/editing
  readonly width?: string | number
  readonly isSortable?: boolean
  readonly isFilterable?: boolean
  readonly isHiddenByDefault?: boolean
}

/**
 * A data collection grid.
 */
export interface GridContract {
  readonly id: string
  readonly columns: readonly GridColumnContract[]
  readonly selectionMode: 'none' | 'single' | 'multiple'
  readonly enablePagination: boolean
  // If true, selecting a row updates the contextual ID for the Side Panel
  readonly bindsToSidePanel?: boolean
}
