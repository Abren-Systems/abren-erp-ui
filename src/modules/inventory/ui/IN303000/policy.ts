import type { ScreenStatePolicy } from '@/platform/screen-runtime/screen-state-policy.types'

export type AdjustmentStatus = 'DRAFT' | 'POSTED'

/**
 * IN303000 State Policy
 */
export const IN303000_POLICY: ScreenStatePolicy<AdjustmentStatus, string> = {
  states: {
    DRAFT: {
      editable: true,
      fields: {},
    },
    POSTED: {
      editable: false,
      fields: {},
    },
  },
}
