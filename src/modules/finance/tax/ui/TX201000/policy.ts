import type { ScreenStatePolicy } from '@/platform/screen-runtime/screen-state-policy.types'

export type TaxGroupStatus = 'ACTIVE' | 'INACTIVE'

/**
 * TX201000 State Policy
 *
 * Defines visual behavior and field editability for Tax Groups.
 * Maintenance screens are generally editable in all active states,
 * but specific policies can be enforced for INACTIVE records.
 */
export const TX201000_POLICY: ScreenStatePolicy<TaxGroupStatus, string> = {
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
