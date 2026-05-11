import { createColumnHelper } from '@tanstack/vue-table'
import type { JournalEntry } from '../../../models/journal-entry.types'

const helper = createColumnHelper<JournalEntry>()

export const journalEntryColumns = [
  helper.accessor('entryNumber', {
    header: 'Entry Number',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('status', {
    header: 'Status',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('entryDate', {
    header: 'Date',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('description', {
    header: 'Description',
    cell: (info) => info.getValue() || '—',
  }),
]
