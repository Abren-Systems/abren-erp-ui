import type { SemanticKind } from '../semantic-runtime/contracts'

// ── Field Contracts ────────────────────────────────────────────────────────
// Pure data definitions for form inputs and display values.
// These contracts govern how `AppField`, `AppInput`, and Cells render.

export type PrimitiveType = 'string' | 'number' | 'boolean' | 'date'

export interface FieldOptionContract {
  readonly value: string | number
  readonly label: string
  readonly description?: string
}

/**
 * A discrete data entry or display field.
 */
export interface FieldContract {
  readonly id: string
  readonly type: PrimitiveType
  readonly semantic?: SemanticKind
  readonly labelKey: string
  readonly required?: boolean
  readonly disabled?: boolean
  readonly hidden?: boolean
  readonly options?: readonly FieldOptionContract[] // For select/reference types
}
