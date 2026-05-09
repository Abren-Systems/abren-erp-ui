import type { FieldDefinition } from '@/platform/field-system/field-definition.types'

/** Matches the form-projection entity shape used in the controller */
interface LedgerSettingsFormEntity {
  default_bridge_account_id: string
  pr_payable_account_id: string
}

export const GL102000_FIELDS = {
  default_bridge_account_id: {
    key: 'default_bridge_account_id',
    label: 'Default Bridge Account',
    type: 'selector',
    description: 'Used for temporary holding during multi-step reconciliations.',
  } as FieldDefinition<LedgerSettingsFormEntity, string>,

  pr_payable_account_id: {
    key: 'pr_payable_account_id',
    label: 'PR Payable Account',
    type: 'selector',
    description: 'Default liability account for Payment Request accruals.',
  } as FieldDefinition<LedgerSettingsFormEntity, string>,
} as const
