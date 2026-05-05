import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { StockItem } from '../../domain/inventory.types'

export const IN202500_FIELDS = {
  itemId: {
    key: 'itemId',
    label: 'Item ID',
    type: 'selector',
    required: () => true,
  },
  warehouseId: {
    key: 'warehouseId',
    label: 'Warehouse',
    type: 'selector',
    required: () => true,
  },
  quantity: {
    key: 'quantity',
    label: 'Quantity',
    type: 'number',
    required: () => true,
  },
  totalValue: {
    key: 'totalValue',
    label: 'Total Value',
    type: 'amount',
    required: () => true,
  },
} satisfies Record<string, FieldDefinition<StockItem>>
