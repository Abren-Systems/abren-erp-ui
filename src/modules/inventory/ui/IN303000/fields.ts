import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { Adjustment } from '../../models/inventory.types'

export const IN303000_FIELDS = {
  warehouseId: {
    key: 'warehouseId',
    label: 'Warehouse',
    type: 'selector',
  },
  reason: {
    key: 'reason',
    label: 'Reason for Adjustment',
    type: 'text',
  },
} satisfies Record<string, FieldDefinition<Adjustment>>
