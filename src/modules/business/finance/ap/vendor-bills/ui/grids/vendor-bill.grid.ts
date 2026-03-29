import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/core/ui/badge'
import type { VendorBill } from '../../domain/models/vendor-bill.types'

export const vendorBillColumns: ColumnDef<VendorBill>[] = [
  {
    accessorKey: 'billNumber',
    header: 'Bill #',
    cell: ({ row }) => h('span', { class: 'font-mono' }, row.original.billNumber),
  },
  {
    accessorKey: 'issueDate',
    header: 'Issue Date',
    cell: ({ row }) => row.original.issueDate.toLocaleDateString(),
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => row.original.dueDate.toLocaleDateString(),
  },
  {
    accessorKey: 'totalAmount',
    header: 'Amount',
    cell: ({ row }) =>
      h('div', { class: 'text-right font-mono' }, row.original.totalAmount.format()),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
        DRAFT: 'secondary',
        VALIDATED: 'default',
        PAID: 'secondary',
      }
      return h(Badge, { variant: (variants[status] || 'default') as 'default' }, () => status)
    },
  },
]
