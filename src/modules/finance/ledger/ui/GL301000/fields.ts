import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { JournalEntry } from '../../models/journal-entry.types'

/**
 * GL301000 — Field Registry Bindings
 */
export const GL301000_FIELDS = {
  entryNumber: {
    key: 'entryNumber',
    label: 'Entry Number',
    type: 'text',
  },
  status: {
    key: 'status',
    label: 'Status',
    type: 'text',
  },
  entryDate: {
    key: 'entryDate',
    label: 'Entry Date',
    type: 'date',
  },
  description: {
    key: 'description',
    label: 'Description',
    type: 'text',
  },
} satisfies Record<string, FieldDefinition<JournalEntry>>
