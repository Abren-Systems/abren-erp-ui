import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { MoneyCell, DateCell } from '@/shared/components/data-grid'
import type { VendorBill } from '../../../domain/ap.types'

/**
 * Vendor Bill Grid Columns.
 *
 * Designed for high-density scanability.
 * Column alignment follows UX_ARCHITECTURE.md:
 *   - Numbers/Currency → right-aligned, tabular-nums
 *   - IDs/Codes → monospace
 *   - Text → left-aligned
 */

const STATUS_DOT: Record<string, string> = {
  DRAFT: 'bg-neutral-400',
  VALIDATED: 'bg-primary-500',
  PAID: 'bg-success-500',
}

export const vendorBillColumns: ColumnDef<VendorBill>[] = [
  {
    accessorKey: 'billNumber',
    header: 'Bill #',
    size: 110,
    cell: ({ row }) =>
      h(
        'code',
        {
          class:
            'px-2 py-0.5 rounded bg-neutral-100 text-[10px] text-neutral-600 font-bold font-mono tracking-tight border border-neutral-200',
        },
        row.original.billNumber,
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
    accessorKey: 'vendorId',
    header: 'Vendor',
    cell: ({ row }) => {
      // Hydrate via view model or fallback to sliced ID
      const name =
        (row.original as VendorBill & { vendorName?: string }).vendorName ??
        row.original.vendorId.slice(0, 8)
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
    accessorKey: 'issueDate',
    header: () => h('span', { class: 'w-full text-center block' }, 'Issue Date'),
    size: 100,
    cell: ({ row }) => h(DateCell, { date: row.original.issueDate, class: 'text-center block' }),
  },
  {
    accessorKey: 'dueDate',
    header: () => h('span', { class: 'w-full text-center block' }, 'Due Date'),
    size: 100,
    cell: ({ row }) => h(DateCell, { date: row.original.dueDate, class: 'text-center block' }),
  },
]
