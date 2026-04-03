import { h } from 'vue'
import { type ColumnDef } from '@tanstack/vue-table'
import { DataGridColumnHeader, BadgeCell } from '@/shared/components/data-grid'
import type { Account } from '../../../domain/account.types'

/**
 * Ledger Account Grid Column Definitions
 *
 * Separates grid configuration from the Vue template to ensure
 * testability and maintainability at scale.
 */
export const accountColumns: ColumnDef<Account>[] = [
  {
    accessorKey: 'code',
    size: 100,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Code' }),
    cell: ({ row }) =>
      h(
        'span',
        {
          class: 'font-mono text-[11.5px] text-neutral-500',
        },
        row.getValue('code'),
      ),
  },
  {
    accessorKey: 'name',
    size: 300,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Name' }),
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.getValue('name')),
  },
  {
    accessorKey: 'type',
    size: 140,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Type' }),
    cell: ({ row }) => {
      const type = row.getValue<string>('type')
      const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        ASSET: 'default',
        LIABILITY: 'destructive',
        EQUITY: 'secondary',
        REVENUE: 'default',
        EXPENSE: 'outline',
      }
      return h(BadgeCell, { status: type, variants })
    },
  },
  {
    accessorKey: 'currency',
    size: 80,
    enableSorting: false,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Currency' }),
    cell: ({ row }) => h('span', { class: 'text-right block' }, row.getValue('currency') ?? '—'),
  },
  {
    accessorKey: 'isActive',
    size: 80,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Status' }),
    cell: ({ row }) => {
      const isActive = row.getValue<boolean>('isActive')
      return h(BadgeCell, {
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        variants: {
          ACTIVE: 'default',
          INACTIVE: 'secondary',
        },
      })
    },
  },
]
