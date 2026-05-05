import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { JournalEntry } from '../../domain/journal-entry.types'

/**
 * GL301000 — Field Registry Bindings
 */
export const GL301000_FIELDS = {
  entryNumber: {
    name: 'entryNumber',
    label: 'Entry Number',
    type: 'text',
    required: false,
    readOnly: true, // System generated
  },
  status: {
    name: 'status',
    label: 'Status',
    type: 'status',
    readOnly: true,
  },
  entryDate: {
    name: 'entryDate',
    label: 'Entry Date',
    type: 'text', // In a real system, 'date'
    required: true,
  },
  description: {
    name: 'description',
    label: 'Description',
    type: 'text',
    required: false,
  },
} satisfies Record<string, FieldDefinition<JournalEntry>>
