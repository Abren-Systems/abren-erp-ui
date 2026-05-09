import type { ScreenStatePolicy } from '@/platform/screen-runtime'

/**
 * GL102000 - Ledger Settings Screen State Policy
 */

export type LedgerSettingsStatus = 'OPEN' | 'MISSING_PREREQUISITES'

export type LedgerSettingsFieldKey = 'default_bridge_account_id' | 'pr_payable_account_id'

export const GL102000_POLICY: ScreenStatePolicy<LedgerSettingsStatus, LedgerSettingsFieldKey> = {
  states: {
    OPEN: {
      editable: true,
      fields: {
        default_bridge_account_id: { required: true },
        pr_payable_account_id: { required: true },
      },
    },
    MISSING_PREREQUISITES: {
      editable: false,
      banner: {
        messageKey: 'ledger.GL102000.banner.missing_accounts',
        variant: 'danger',
      },
    },
  },
}
