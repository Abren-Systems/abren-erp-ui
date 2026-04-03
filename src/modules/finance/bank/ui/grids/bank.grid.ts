import { h } from 'vue'
import { type ColumnDef } from '@tanstack/vue-table'
import { DataGridColumnHeader, MoneyCell, BadgeCell } from '@/shared/components/data-grid'
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
    cell: ({ row }) => h('span', { class: 'font-semibold' }, row.getValue('accountName')),
  },
  {
    accessorKey: 'bankName',
    size: 180,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Bank' }),
    cell: ({ row }) => h('span', { class: 'text-neutral-500' }, row.getValue('bankName')),
  },
  {
    accessorKey: 'accountNumber',
    size: 180,
    enableSorting: false,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Account Number' }),
    cell: ({ row }) =>
      h('span', { class: 'font-mono text-[11.5px] opacity-80' }, row.getValue('accountNumber')),
  },
  {
    accessorKey: 'balance',
    size: 150,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Current Balance' }),
    cell: ({ row }) => h(MoneyCell, { amount: row.original.balance, class: 'block text-right' }),
  },
  {
    accessorKey: 'status',
    size: 100,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Status' }),
    cell: ({ row }) => {
      const status = row.getValue<string>('status')
      const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        ACTIVE: 'default',
        INACTIVE: 'secondary',
        FROZEN: 'destructive',
      }
      return h(BadgeCell, { status, variants })
    },
  },
]
