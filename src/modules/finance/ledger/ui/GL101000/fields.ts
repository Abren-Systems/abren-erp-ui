import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { components } from '@/shared/api/generated.types'

type LedgerSettingsDTO = components['schemas']['LedgerSettingsDTO']

export const GL101000_FIELDS = {
  default_bridge_account_id: {
    key: 'default_bridge_account_id',
    label: 'Default Bridge Account',
    type: 'selector',
    description: 'Used for temporary holding during multi-step reconciliations.',
  } as FieldDefinition<LedgerSettingsDTO, string>,

  pr_payable_account_id: {
    key: 'pr_payable_account_id',
    label: 'PR Payable Account',
    type: 'selector',
    description: 'Default liability account for Payment Request accruals.',
  } as FieldDefinition<LedgerSettingsDTO, string>,
} as const
