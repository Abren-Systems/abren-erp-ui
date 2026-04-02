import type { FiscalPeriod } from '../../domain/fiscal-period.types'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Badge } from '@/shared/components/badge'

/**
 * Grid definition for Fiscal Periods.
 */
export const fiscalPeriodColumns: ColumnDef<FiscalPeriod>[] = [
  {
    accessorKey: 'name',
    header: 'Period Name',
    cell: ({ row }) => h('span', { class: 'font-semibold' }, row.original.name),
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }) => row.original.startDate,
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: ({ row }) => row.original.endDate,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const variant = status === 'OPEN' ? 'success' : 'secondary'
      return h(Badge, { variant }, () => status)
    },
  },
]
