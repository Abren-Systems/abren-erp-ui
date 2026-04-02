import type { JournalEntry } from '../../domain/journal-entry.types'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Badge } from '@/shared/components/badge'

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
    cell: ({ row }) => row.original.entryDate,
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
    cell: ({ row }) => {
      const status = row.original.status
      const variant =
        status === 'POSTED' ? 'success' : status === 'VOIDED' ? 'destructive' : 'secondary'
      return h(Badge, { variant }, () => status)
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
]
