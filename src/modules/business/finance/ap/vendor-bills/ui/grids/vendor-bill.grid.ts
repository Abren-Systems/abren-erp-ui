import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/core/ui/badge'
import type { VendorBillDTO } from '../../infrastructure/api.types'
import { Money } from '@/core/domain/money'

export const vendorBillColumns: ColumnDef<VendorBillDTO>[] = [
  {
    accessorKey: 'bill_number',
    header: 'Bill #',
    cell: ({ row }) => h('span', { class: 'font-mono' }, row.original.bill_number),
  },
  {
    accessorKey: 'issue_date',
    header: 'Issue Date',
    cell: ({ row }) => new Date(row.original.issue_date).toLocaleDateString(),
  },
  {
    accessorKey: 'due_date',
    header: 'Due Date',
    cell: ({ row }) => new Date(row.original.due_date).toLocaleDateString(),
  },
  {
    accessorKey: 'total_amount',
    header: 'Amount',
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right font-mono' },
        Money.from(row.original.total_amount, row.original.currency).format(),
      ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const variants: Record<string, string> = {
        DRAFT: 'secondary',
        VALIDATED: 'default',
        PAID: 'success',
      }
      return h(Badge, { variant: variants[status] || 'default' }, () => status)
    },
  },
]
