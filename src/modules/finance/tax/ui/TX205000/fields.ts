import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { TaxRule } from '../../models/tax.types'

export const TX205000_FIELDS = {
  name: {
    key: 'name',
    label: 'Rule Name',
    type: 'text',
  } as FieldDefinition<TaxRule, string>,

  rate: {
    key: 'rate',
    label: 'Rate',
    type: 'number',
  } as FieldDefinition<TaxRule, number>,

  taxType: {
    key: 'taxType',
    label: 'Tax Type',
    type: 'selector',
  } as FieldDefinition<TaxRule, string>,

  direction: {
    key: 'direction',
    label: 'Direction',
    type: 'selector',
  } as FieldDefinition<TaxRule, string>,

  glAccountId: {
    key: 'glAccountId',
    label: 'GL Account',
    type: 'selector',
  } as FieldDefinition<TaxRule, string>,

  isActive: {
    key: 'isActive',
    label: 'Active',
    type: 'checkbox',
  } as FieldDefinition<TaxRule, boolean>,
} as const
