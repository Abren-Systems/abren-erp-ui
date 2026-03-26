import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/core/ui/badge'
import type { PaymentRequest } from '../../domain/models/payment-request.types'

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
    cell: ({ row }) =>
      h('span', { class: 'font-bold tabular-nums' }, row.original.totalAmount.format()),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        Badge,
        { variant: STATUS_VARIANT[row.original.status] ?? 'outline' },
        () => row.original.status,
      ),
  },
  {
    accessorKey: 'submittedAt',
    header: 'Submitted',
    cell: ({ row }) => row.original.submittedAt?.toLocaleDateString('en-ET') ?? '—',
  },
  {
    accessorKey: 'currentApprovalStep',
    header: 'Approval Step',
    cell: ({ row }) =>
      h('span', { class: 'text-neutral-500 text-sm' }, `Step ${row.original.currentApprovalStep}`),
  },
]
