import { h } from 'vue'
import type { Row } from '@tanstack/vue-table'
import type { PaymentRequestLine } from '../../../domain/ap.types'
import { MoneyCell } from '@/shared/components/data-grid'

/**
 * Grid column metadata for the Payment Request Lines collection view.
 * Extracted from the Focus screen for Acumatica alignment.
 */
export const paymentRequestLineColumns = [
  {
    id: 'index',
    header: 'LINE #',
    cell: ({ row }: { row: Row<PaymentRequestLine> }) =>
      h('span', { class: 'font-mono text-xs text-neutral-500' }, row.index + 1),
    size: 80,
  },
  {
    id: 'description',
    header: 'DESCRIPTION',
    accessorKey: 'description',
  },
  {
    id: 'amount',
    header: 'AMOUNT',
    cell: ({ row }: { row: Row<PaymentRequestLine> }) =>
      h(MoneyCell, { amount: row.original.amount, align: 'right' }),
    size: 150,
  },
]
