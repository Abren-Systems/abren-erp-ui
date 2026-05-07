import type { ScreenStatePolicy } from '@/platform/screen-runtime/screen-state-policy.types'

export type TaxRuleStatus = 'ACTIVE' | 'INACTIVE'

/**
 * TX202000 State Policy
 *
 * Maintenance screen for Tax Rules.
 */
export const TX202000_POLICY: ScreenStatePolicy<TaxRuleStatus, string> = {
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
