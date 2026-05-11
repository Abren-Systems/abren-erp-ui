import { createColumnHelper } from '@tanstack/vue-table'
import type { JournalEntryLine } from '../../../models/journal-entry.types'

const helper = createColumnHelper<JournalEntryLine>()

/**
 * GL301000 — Journal Entry Lines Grid Definition
 */
export const journalLineColumns = [
  helper.accessor('accountId', {
    header: 'Account',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('description', {
    header: 'Description',
    cell: (info) => info.getValue() || '—',
  }),
  helper.accessor('debit', {
    header: 'Debit',
    cell: (info) => {
      const val = info.getValue()
      return val.amount > 0 ? val.format('en-ET') : ''
    },
    meta: { align: 'right' },
  }),
  helper.accessor('credit', {
    header: 'Credit',
    cell: (info) => {
      const val = info.getValue()
      return val.amount > 0 ? val.format('en-ET') : ''
    },
    meta: { align: 'right' },
  }),
  helper.accessor('originalCurrency', {
    header: 'Currency',
    cell: (info) => info.getValue() ?? 'ETB',
    meta: { align: 'right' },
  }),
]
