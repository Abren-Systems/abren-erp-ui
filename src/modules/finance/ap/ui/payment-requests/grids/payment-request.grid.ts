import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { MoneyCell, DateCell } from '@/shared/components/data-grid'
import type { PaymentRequest } from '../../../domain/ap.types'

/**
 * Payment Request Grid Columns.
 *
 * Designed for two modes:
 * - Full Width: Shows all columns when no split view is active.
 * - Compact: Automatically hides lower-priority columns via column visibility.
 *
 * Column alignment follows UX_ARCHITECTURE.md:
 *   - Numbers/Currency → right-aligned, tabular-nums
 *   - IDs/Codes → monospace
 *   - Text → left-aligned
 */

const STATUS_DOT: Record<string, string> = {
  DRAFT: 'bg-neutral-400',
  SUBMITTED: 'bg-warning-500',
  APPROVED: 'bg-info-500',
  AUTHORIZED: 'bg-success-500',
  REJECTED: 'bg-danger-500',
  CANCELLED: 'bg-neutral-600',
}

export const paymentRequestColumns: ColumnDef<PaymentRequest>[] = [
  {
    accessorKey: 'requestNumber',
    header: 'Ref',
    size: 100,
    cell: ({ row }) =>
      h(
        'code',
        {
          class:
            'px-2 py-0.5 rounded bg-neutral-100 text-[10px] text-neutral-600 font-bold font-mono tracking-tight border border-neutral-200',
        },
        row.original.requestNumber.toUpperCase(),
      ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 110,
    cell: ({ row }) => {
      const status = row.original.status
      const label = status.charAt(0) + status.slice(1).toLowerCase()
      return h('div', { class: 'flex items-center gap-1.5' }, [
        h('span', {
          class: `h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] ?? 'bg-neutral-300'}`,
        }),
        h('span', { class: 'text-xs font-semibold text-neutral-700' }, label),
      ])
    },
  },
  {
    accessorKey: 'beneficiaryId',
    header: 'Beneficiary',
    cell: ({ row }) => {
      const name =
        (row.original as PaymentRequest & { beneficiaryName?: string }).beneficiaryName ??
        row.original.beneficiaryId.slice(0, 8)
      return h(
        'span',
        {
          class: 'text-sm text-neutral-700 font-medium truncate block max-w-[180px]',
          title: name,
        },
        name,
      )
    },
  },
  {
    accessorKey: 'totalAmount',
    header: () => h('span', { class: 'w-full text-right block' }, 'Amount'),
    size: 130,
    cell: ({ row }) => h(MoneyCell, { amount: row.original.totalAmount }),
  },
  {
    accessorKey: 'submittedAt',
    header: () => h('span', { class: 'w-full text-center block' }, 'Submitted'),
    size: 100,
    cell: ({ row }) => h(DateCell, { date: row.original.submittedAt, class: 'text-center block' }),
  },
  {
    accessorKey: 'requesterId',
    header: 'Requested By',
    cell: ({ row }) => {
      const name =
        (row.original as PaymentRequest & { requesterName?: string }).requesterName ??
        row.original.requesterId.slice(0, 8)
      return h(
        'span',
        { class: 'text-neutral-500 text-xs truncate block max-w-[150px]', title: name },
        name,
      )
    },
  },
]
