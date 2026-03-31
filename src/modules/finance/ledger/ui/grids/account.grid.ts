import { h } from 'vue'
import { type ColumnDef } from '@tanstack/vue-table'
import { DataGridColumnHeader } from '@/shared/components/data-grid'
import * as formatter from '../utils/account-formatter'
import type { Account } from '../../domain/account.types'

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
          style:
            'font-family: var(--font-mono); font-size: 11.5px; color: var(--color-grid-text-muted);',
        },
        row.getValue('code'),
      ),
  },
  {
    accessorKey: 'name',
    size: 300,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Name' }),
    cell: ({ row }) => h('span', { style: 'font-weight: 500;' }, row.getValue('name')),
  },
  {
    accessorKey: 'type',
    size: 140,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Type' }),
    cell: ({ row }) => {
      const type = row.getValue<string>('type')
      const color = formatter.getAccountTypeColor(type)
      return h(
        'span',
        {
          style: `
          display: inline-block;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: ${color};
          background: color-mix(in srgb, ${color} 12%, transparent);
          padding: 2px 6px;
          border-radius: 3px;
        `,
        },
        type,
      )
    },
  },
  {
    accessorKey: 'currency',
    size: 80,
    enableSorting: false,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Currency' }),
    cell: ({ row }) =>
      h('span', { style: 'text-align: right; display: block;' }, row.getValue('currency') ?? '—'),
  },
  {
    accessorKey: 'isActive',
    size: 80,
    enableSorting: true,
    header: ({ column }) => h(DataGridColumnHeader, { column, title: 'Status' }),
    cell: ({ row }) => {
      const isActive = row.getValue<boolean>('isActive')
      return h(
        'span',
        {
          style: `
          display: inline-block;
          font-size: 10.5px; font-weight: 600;
          color: ${isActive ? '#10b981' : 'var(--color-grid-text-muted)'};
          background: ${isActive ? 'color-mix(in srgb, #10b981 12%, transparent)' : 'transparent'};
          padding: 2px 6px; border-radius: 3px;
          text-transform: uppercase; letter-spacing: 0.04em;
        `,
        },
        formatter.getAccountStatusLabel(isActive),
      )
    },
  },
]
