import type { FiscalPeriod } from '../../domain/fiscal-period.types'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { DateCell, BadgeCell } from '@/shared/components/data-grid'

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
    cell: ({ row }) => h(DateCell, { date: row.original.startDate }),
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: ({ row }) => h(DateCell, { date: row.original.endDate }),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(BadgeCell, {
        status: row.original.status,
        variants: { OPEN: 'default', CLOSED: 'secondary' },
      }),
  },
]
