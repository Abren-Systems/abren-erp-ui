import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { MoneyCell, DateCell, BadgeCell } from '@/shared/components/data-grid'
import type { PaymentRequest } from '../../../domain/ap.types'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'outline',
  SUBMITTED: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
  PAID: 'default',
}

export const paymentRequestColumns: ColumnDef<PaymentRequest>[] = [
  {
    accessorKey: 'id',
    header: 'Reference',
    cell: ({ row }) =>
      h(
        'code',
        { class: 'text-xs text-neutral-500 font-mono' },
        row.original.id.slice(0, 8).toUpperCase(),
      ),
  },
  {
    accessorKey: 'beneficiaryId',
    header: 'Beneficiary',
    cell: ({ row }) =>
      h('span', { class: 'font-medium text-sm' }, row.original.beneficiaryId.slice(0, 8) + '…'),
  },
  {
    accessorKey: 'totalAmount',
    header: 'Amount',
    cell: ({ row }) => h(MoneyCell, { amount: row.original.totalAmount }),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(BadgeCell, { status: row.original.status, variants: STATUS_VARIANT }),
  },
  {
    accessorKey: 'submittedAt',
    header: 'Submitted',
    cell: ({ row }) => h(DateCell, { date: row.original.submittedAt }),
  },
  {
    accessorKey: 'currentApprovalStep',
    header: 'Approval Step',
    cell: ({ row }) =>
      h('span', { class: 'text-neutral-500 text-sm' }, `Step ${row.original.currentApprovalStep}`),
  },
]
