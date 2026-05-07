import type { ScreenStatePolicy } from '@/platform/screen-runtime'

/**
 * GL201000 - Chart of Accounts Detail Screen State Policy
 */

export type AccountStatus = 'ACTIVE' | 'INACTIVE'

export type AccountFieldKey = 'code' | 'name' | 'type' | 'isActive' | 'currency'

export const GL201000_POLICY: ScreenStatePolicy<AccountStatus, AccountFieldKey> = {
  states: {
    ACTIVE: {
      editable: true,
      fields: {
        code: { readonly: true },
      },
    },
    INACTIVE: {
      editable: false,
      banner: {
        messageKey: 'ledger.GL201000.banner.inactive_account',
        variant: 'warning',
      },
    },
  },
}
