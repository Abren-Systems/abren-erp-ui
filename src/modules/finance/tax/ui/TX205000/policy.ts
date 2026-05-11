import type { ScreenStatePolicy } from '@/platform/screen-runtime/screen-state-policy.types'

export type TaxRuleStatus = 'ACTIVE' | 'INACTIVE'

/**
 * TX205000 State Policy
 *
 * Maintenance screen for Taxes.
 */
export const TX205000_POLICY: ScreenStatePolicy<TaxRuleStatus, string> = {
  states: {
    ACTIVE: {
      editable: true,
      fields: {},
    },
    INACTIVE: {
      editable: true,
      fields: {},
    },
  },
}
