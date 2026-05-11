import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { StockItem } from '../../models/inventory.types'

export const IN202500_FIELDS = {
  itemId: {
    key: 'itemId',
    label: 'Item ID',
    type: 'selector',
  },
  warehouseId: {
    key: 'warehouseId',
    label: 'Warehouse',
    type: 'selector',
  },
  quantity: {
    key: 'quantity',
    label: 'Quantity',
    type: 'number',
  },
  totalValue: {
    key: 'totalValue',
    label: 'Total Value',
    type: 'amount',
  },
} satisfies Record<string, FieldDefinition<StockItem>>
