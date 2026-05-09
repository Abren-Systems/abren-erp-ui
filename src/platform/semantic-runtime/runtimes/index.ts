import type { Component } from 'vue'

export interface FormatterContext {
  locale: string
  tenantId: string
  /** Global semantic policies injected from registry */
  policies?: Record<string, unknown>
}

export type Formatter = (value: unknown, context: FormatterContext) => string
export type Parser = (formattedValue: string, context: FormatterContext) => unknown

export interface FilterOperator {
  id: string
  labelKey: string
  requiresValue: boolean
}

export interface ExportFormatter {
  toCsv: (value: unknown, context: FormatterContext) => string
  toExcel: (value: unknown, context: FormatterContext) => string | number
}

/**
 * Operational behavior mapping for semantics.
 * Defines the executable authority for a semantic kind.
 */
export interface SemanticRuntime {
  /** Synchronous formatting of the primitive value into a display string */
  formatter?: Formatter

  /** Synchronous parsing of user input back to the primitive value */
  parser?: Parser

  /** The Vue component used to render this semantic in read-only mode */
  displayRenderer: Component

  /** The Vue component used to render this semantic in edit mode */
  editorRenderer?: Component

  /** Operators available for filtering in grids */
  filterOperators?: FilterOperator[]

  /** Specialized formatters for data export */
  exportFormatter?: ExportFormatter
}
