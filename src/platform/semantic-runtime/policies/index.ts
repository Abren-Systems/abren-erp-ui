import { SemanticKind } from '../contracts'

/**
 * System-wide policies for semantic kinds.
 * This separates formatting/rendering rules from the components themselves.
 */
export interface SemanticPolicy {
  precision?: number
  currencySource?: string
  negativeStyle?: string
  colorMap?: Record<string, string>
  defaultColor?: string
  format?: string
}

export const SemanticPolicies: Record<SemanticKind, SemanticPolicy> = {
  [SemanticKind.Money]: {
    precision: 2,
    currencySource: 'tenant', // Or 'transaction', 'user'
    negativeStyle: 'parentheses', // Or 'minus'
  },
  [SemanticKind.Status]: {
    colorMap: {
      Draft: 'neutral',
      Pending: 'warning',
      Approved: 'success',
      Rejected: 'danger',
      Closed: 'neutral',
    },
    defaultColor: 'neutral',
  },
  [SemanticKind.LedgerAccount]: {},
  [SemanticKind.Quantity]: {
    precision: 4,
  },
  [SemanticKind.Currency]: {},
  [SemanticKind.Vendor]: {},
  [SemanticKind.Email]: {},
  [SemanticKind.Phone]: {},
  [SemanticKind.Date]: {
    format: 'MM/dd/yyyy',
  },
}
