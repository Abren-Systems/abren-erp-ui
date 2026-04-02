import { h } from 'vue'
import { type ColumnDef } from '@tanstack/vue-table'
import { DataGridColumnHeader } from '@/shared/components/data-grid'
import type { BankAccount } from '../../domain/bank.types'

/**
 * Bank Account Grid Column Definitions
 *
 * Defines the structure and formatting for the Bank Accounts list.
 * Adheres to the Vue 3 Composition API and modular architecture.
 */
export const bankAccountColumns: ColumnDef<BankAccount>[] = [
  {
    accessorKey: 'accountName',
    size: 250,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Account Name' }),
    cell: ({ row }) =>
      h(
        'span',
        { style: 'font-weight: 600; color: var(--color-grid-text);' },
        row.getValue('accountName'),
      ),
  },
  {
    accessorKey: 'bankName',
    size: 180,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Bank' }),
    cell: ({ row }) =>
      h('span', { style: 'color: var(--color-grid-text-muted);' }, row.getValue('bankName')),
  },
  {
    accessorKey: 'accountNumber',
    size: 180,
    enableSorting: false,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Account Number' }),
    cell: ({ row }) =>
      h(
        'span',
        { style: 'font-family: var(--font-mono); font-size: 11.5px; opacity: 0.8;' },
        row.getValue('accountNumber'),
      ),
  },
  {
    accessorKey: 'balance',
    size: 150,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Current Balance' }),
    cell: ({ row }) => {
      const balance = row.original.balance
      return h(
        'span',
        {
          style:
            'text-align: right; display: block; font-weight: 600; font-family: var(--font-mono);',
        },
        balance.format(),
      )
    },
  },
  {
    accessorKey: 'status',
    size: 100,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Status' }),
    cell: ({ row }) => {
      const status = row.getValue<string>('status')
      // status can be 'ACTIVE' | 'INACTIVE' | 'FROZEN'
      const colors: Record<string, string> = {
        ACTIVE: '#10b981',
        INACTIVE: '#6b7280',
        FROZEN: '#ef4444',
      }
      const color = colors[status] || colors.INACTIVE

      return h(
        'span',
        {
          style: `
            display: inline-block;
            font-size: 10.5px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: ${color};
            background: color-mix(in srgb, ${color} 12%, transparent);
            padding: 2px 6px;
            border-radius: 3px;
          `,
        },
        status,
      )
    },
  },
]
