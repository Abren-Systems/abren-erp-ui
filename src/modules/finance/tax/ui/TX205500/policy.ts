import type { ScreenStatePolicy } from '@/platform/screen-runtime/screen-state-policy.types'

export type TaxGroupStatus = 'ACTIVE' | 'INACTIVE'

/**
 * TX205500 State Policy
 *
 * Maintenance screen for Tax Groups.
 */
export const TX205500_POLICY: ScreenStatePolicy<TaxGroupStatus, string> = {
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
