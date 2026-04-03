import type { JournalEntry } from '../../domain/journal-entry.types'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { DateCell, BadgeCell } from '@/shared/components/data-grid'

/**
 * Grid definition for Journal Entries.
 *
 * Encapsulates the column configuration and rendering logic
 * for the journal entries list.
 */
export const journalEntryColumns: ColumnDef<JournalEntry>[] = [
  {
    accessorKey: 'entryNumber',
    header: 'Entry #',
    cell: ({ row }) => h('span', { class: 'font-mono font-bold' }, row.original.entryNumber),
  },
  {
    accessorKey: 'entryDate',
    header: 'Date',
    cell: ({ row }) => h(DateCell, { date: row.original.entryDate }),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) =>
      h('span', { class: 'text-neutral-600 truncate max-w-xs block' }, row.original.description),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(BadgeCell, {
        status: row.original.status,
        variants: {
          POSTED: 'default',
          VOIDED: 'destructive',
          DRAFT: 'secondary',
        },
      }),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => h(DateCell, { date: row.original.createdAt }),
  },
]
