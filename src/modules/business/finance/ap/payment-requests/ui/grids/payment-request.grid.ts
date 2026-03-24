import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { PaymentRequest } from '../../domain/models/payment-request.types'

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
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.original.beneficiaryId.slice(0, 8)), // In real app, name lookup
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => h('span', { class: 'font-bold' }, row.original.amount.format()),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const statusMap: Record<string, string> = {
        DRAFT: 'bg-neutral-100 text-neutral-700',
        AWAITING_APPROVAL: 'bg-warning-50 text-warning-700 border border-warning-100',
        APPROVED: 'bg-success-50 text-success-700 border border-success-100',
        REJECTED: 'bg-danger-50 text-danger-700 border border-danger-100',
        PAID: 'bg-primary-50 text-primary-700 border border-primary-100',
      }
      return h(
        'span',
        {
          class: `px-2 py-0.5 rounded-full text-xs font-semibold ${statusMap[row.original.status] || 'bg-neutral-100'}`,
        },
        row.original.status,
      )
    },
  },
  {
    accessorKey: 'submittedAt',
    header: 'Date',
    cell: ({ row }) => row.original.submittedAt?.toLocaleDateString() || '-',
  },
]
