import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { AdjustmentDTO } from '../../infrastructure/api.types'

export const IN303000_FIELDS = {
  warehouse_id: {
    key: 'warehouse_id',
    label: 'Warehouse',
    type: 'selector',
    required: () => true,
  },
  reason: {
    key: 'reason',
    label: 'Reason for Adjustment',
    type: 'text',
    required: () => true,
  },
} satisfies Record<string, FieldDefinition<AdjustmentDTO>>
