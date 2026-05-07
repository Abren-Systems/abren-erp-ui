import type { ScreenStatePolicy } from '@/platform/screen-runtime/screen-state-policy.types'

export type WarehouseStatus = 'ACTIVE' | 'INACTIVE'

/**
 * IN204000 State Policy
 */
export const IN204000_POLICY: ScreenStatePolicy<WarehouseStatus, string> = {
  states: {
    ACTIVE: {
      editable: true,
      fields: {
        code: { readonly: true }, // Cannot change code on existing record
      },
    },
    INACTIVE: {
      editable: false,
      fields: {},
    },
  },
}
