import type { FiscalPeriod } from '../../domain/fiscal-calendar.types'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { DateCell, BadgeCell, SelectionCell } from '@/shared/components/data-grid'
import { AppCheckbox } from '@/shared/components/primitives'

/**
 * Grid definition for Fiscal Periods (Process Mode).
 * Includes selection and core data, excludes individual actions.
 */
export const fiscalPeriodProcessColumns: ColumnDef<FiscalPeriod>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(AppCheckbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected(),
        'onUpdate:checked': (value: boolean) => table.toggleAllPageRowsSelected(value),
      }),
    cell: ({ row }) =>
      h(SelectionCell, {
        checked: row.getIsSelected(),
        'onUpdate:checked': (value: boolean) => row.toggleSelected(value),
      }),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
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
]
