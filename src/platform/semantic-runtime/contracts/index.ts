export const enum SemanticKind {
  Money = 'Money',
  Status = 'Status',
  LedgerAccount = 'LedgerAccount',
  Quantity = 'Quantity',
  Currency = 'Currency',
  Vendor = 'Vendor',
  Email = 'Email',
  Phone = 'Phone',
  Date = 'Date',
}

/**
 * Pure declarative metadata defining the capabilities of a semantic kind.
 * SMI-04: Semantic definitions must remain serializable and stateless.
 * No reactive refs or closures.
 */
export interface SemanticContract {
  kind: SemanticKind

  /** The underlying data type required to store this semantic */
  primitiveType: 'number' | 'string' | 'boolean' | 'date'

  /** Capability flags for grid operations */
  supportsFiltering: boolean
  supportsAggregation: boolean
  supportsSorting: boolean

  /** Flag to indicate if this semantic can be safely serialized to JSON without loss */
  serializable: boolean

  /** Array of declarative validation rule IDs or configurations */
  validationConfigs?: string[]
}
