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
  APPROVED: 'bg-primary-500',
  REJECTED: 'bg-danger-500',
  PAID: 'bg-success-500',
}

export const paymentRequestColumns: ColumnDef<PaymentRequest>[] = [
  {
    accessorKey: 'id',
    header: 'Ref',
    size: 90,
    cell: ({ row }) =>
      h(
        'code',
        { class: 'text-xs text-neutral-500 font-mono' },
        row.original.id.slice(0, 8).toUpperCase(),
      ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 40,
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-1.5' }, [
        h('span', {
          class: `h-2 w-2 rounded-full ${STATUS_DOT[row.original.status] ?? 'bg-neutral-300'}`,
        }),
        h('span', { class: 'text-xs font-medium text-neutral-600' }, row.original.status),
      ]),
  },
  {
    accessorKey: 'beneficiaryId',
    header: 'Beneficiary',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-sm text-neutral-700 font-medium' },
        row.original.beneficiaryId.slice(0, 8) + '…',
      ),
  },
  {
    accessorKey: 'totalAmount',
    header: () => h('span', { class: 'w-full text-right block' }, 'Amount'),
    size: 130,
    cell: ({ row }) => h(MoneyCell, { amount: row.original.totalAmount }),
  },
  {
    accessorKey: 'submittedAt',
    header: 'Submitted',
    cell: ({ row }) => h(DateCell, { date: row.original.submittedAt }),
  },
  {
    accessorKey: 'currentApprovalStep',
    header: 'Step',
    size: 60,
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-neutral-400 text-xs font-mono' },
        `${row.original.currentApprovalStep}`,
      ),
  },
]
