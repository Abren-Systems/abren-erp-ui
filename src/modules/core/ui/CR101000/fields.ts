import type { FieldDefinition } from '@/platform/field-system/field-definition.types'

export const CR101000_FIELDS = {
  name: {
    key: 'name',
    label: 'Role Name',
    type: 'text',
    required: () => true,
  },
  description: {
    key: 'description',
    label: 'Description',
    type: 'text',
    required: () => false,
  },
} satisfies Record<string, FieldDefinition<Record<string, unknown>>>
