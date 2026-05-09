import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { AdjustmentDTO } from '../../infrastructure/api.types'

export const IN303000_FIELDS = {
  warehouse_id: {
    key: 'warehouse_id',
    label: 'Warehouse',
    type: 'selector',
  },
  reason: {
    key: 'reason',
    label: 'Reason for Adjustment',
    type: 'text',
  },
} satisfies Record<string, FieldDefinition<AdjustmentDTO>>
