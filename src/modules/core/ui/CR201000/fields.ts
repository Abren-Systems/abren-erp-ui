import type { FieldDefinition } from '@/platform/field-system/field-definition.types'

export const CR201000_FIELDS = {
  email: {
    key: 'email',
    label: 'Email Address',
    type: 'text',
    required: () => true,
  },
  password: {
    key: 'password',
    label: 'Initial Password',
    type: 'text',
    required: () => true,
  },
  role_id: {
    key: 'role_id',
    label: 'Assigned Role',
    type: 'selector',
    required: () => true,
  },
} satisfies Record<string, FieldDefinition<Record<string, unknown>>>
