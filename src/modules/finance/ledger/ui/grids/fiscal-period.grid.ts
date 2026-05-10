import type { FiscalPeriod } from '../../domain/fiscal-calendar.types'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { DateCell, BadgeCell } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'

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
        variants: { OPEN: 'default', CLOSED: 'secondary', LOCKED: 'destructive' },
      }),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        closePeriod: (id: string) => Promise<void>
        lockPeriod: (id: string) => Promise<void>
      }
      const period = row.original

      return h('div', { class: 'flex gap-2' }, [
        period.status === 'OPEN' &&
          h(
            AppButton,
            {
              size: 'xs',
              variant: 'outline',
              onClick: () => meta?.closePeriod(period.id),
            },
            () => 'Close',
          ),

        period.status === 'CLOSED' &&
          h(
            AppButton,
            {
              size: 'xs',
              variant: 'outline',
              onClick: () => meta?.lockPeriod(period.id),
            },
            () => 'Lock',
          ),
      ])
    },
  },
]
