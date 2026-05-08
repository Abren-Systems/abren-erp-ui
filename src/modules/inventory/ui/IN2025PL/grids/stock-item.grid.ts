import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { StockItem } from '../../../domain/inventory.types'
import TraceabilityBadge from '@/shared/ui/inventory/TraceabilityBadge.vue'

export const stockColumns: ColumnDef<StockItem>[] = [
  {
    accessorKey: 'itemId', // Requires denormalization in mapper
    header: 'SKU',
    cell: ({ row }) => {
      const id = row.getValue('itemId') as string
      return id.slice(0, 8) + '...'
    },
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity (Physical)',
  },
  {
    accessorKey: 'totalValue',
    header: 'Total Value (ETB)',
    cell: ({ row }) => {
      const value = row.getValue('totalValue') as number
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'ETB',
      }).format(value)
    },
  },
  {
    accessorKey: 'traceability',
    header: 'Traceability',
    cell: ({ row }) => {
      const original = row.original
      const mode = original.serialId ? 'SERIAL' : original.batchId ? 'BATCH' : 'NONE'
      return h(TraceabilityBadge, { trackingMode: mode })
    },
  },
]
