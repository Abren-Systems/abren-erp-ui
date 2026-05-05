import type { FieldDefinition } from '@/platform/field-system/field-definition.types'

export const IN303000_FIELDS = {
  warehouseId: {
    key: 'warehouseId',
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
} satisfies Record<string, FieldDefinition<any>>
