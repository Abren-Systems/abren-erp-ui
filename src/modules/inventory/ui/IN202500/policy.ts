import type { ScreenStatePolicy } from '@/platform/screen-runtime/screen-state-policy.types'

export type StockItemStatus = 'ACTIVE' | 'INACTIVE'

/**
 * IN202500 State Policy
 */
export const IN202500_POLICY: ScreenStatePolicy<StockItemStatus, string> = {
  states: {
    ACTIVE: {
      editable: true,
      fields: {
        itemId: { readonly: true }, // Cannot change item on existing record
        warehouseId: { readonly: true }, // Cannot change warehouse
      },
    },
    INACTIVE: {
      editable: false,
      fields: {},
    },
  },
}
