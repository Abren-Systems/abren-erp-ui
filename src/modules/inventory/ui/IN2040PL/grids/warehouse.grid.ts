import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Warehouse } from '../../../domain/inventory.types'
import { AppBadge } from '@/shared/components/primitives'
import TraceabilityBadge from '@/shared/ui/inventory/TraceabilityBadge.vue'

export const warehouseColumns: ColumnDef<Warehouse>[] = [
  {
    accessorKey: 'code',
    header: 'Warehouse Code',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'isQuarantine',
    header: 'Regulatory Status',
    cell: ({ row }) => {
      const isQuarantine = row.getValue('isQuarantine') as boolean
      return h(TraceabilityBadge, { isQuarantine })
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return h(AppBadge, { variant: isActive ? 'success' : 'neutral' }, () =>
        isActive ? 'Active' : 'Inactive',
      )
    },
  },
]
