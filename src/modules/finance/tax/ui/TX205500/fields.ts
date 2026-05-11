import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { CalculationMethod } from '../../models/tax.types'

/** Matches the form-projection entity shape used in the controller */
interface TaxGroupFormEntity {
  name: string
  method: CalculationMethod
  ruleIds: string[]
  isActive: boolean
}

export const TX205500_FIELDS = {
  name: {
    key: 'name',
    label: 'Group Name',
    type: 'text',
  } as FieldDefinition<TaxGroupFormEntity, string>,

  method: {
    key: 'method',
    label: 'Calculation Method',
    type: 'selector',
  } as FieldDefinition<TaxGroupFormEntity, string>,

  isActive: {
    key: 'isActive',
    label: 'Active',
    type: 'checkbox',
  } as FieldDefinition<TaxGroupFormEntity, boolean>,
} as const
