import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { MoneyCell, DateCell, BadgeCell } from '@/shared/components/data-grid'
import type { VendorBill } from '../../../domain/ap.types'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  VALIDATED: 'default',
  PAID: 'secondary',
}

export const vendorBillColumns: ColumnDef<VendorBill>[] = [
  {
    accessorKey: 'billNumber',
    header: 'Bill #',
    cell: ({ row }) => h('span', { class: 'font-mono' }, row.original.billNumber),
  },
  {
    accessorKey: 'issueDate',
    header: 'Issue Date',
    cell: ({ row }) => h(DateCell, { date: row.original.issueDate }),
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => h(DateCell, { date: row.original.dueDate }),
  },
  {
    accessorKey: 'totalAmount',
    header: 'Amount',
    cell: ({ row }) =>
      h(MoneyCell, { amount: row.original.totalAmount, class: 'block text-right' }),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(BadgeCell, { status: row.original.status, variants: STATUS_VARIANT }),
  },
]
