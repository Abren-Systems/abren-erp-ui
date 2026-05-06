import type { ScreenStatePolicy } from '@/platform/screen-runtime'

/**
 * CA202000 — Bank Account State Policy
 *
 * | State    | Editable | Notes                                  |
 * |----------|----------|----------------------------------------|
 * | ACTIVE   | ✅       | Normal operation — all fields editable  |
 * | INACTIVE | ✅       | Can edit to reactivate                  |
 * | FROZEN   | ❌       | Locked — requires investigation         |
 */

export type BankAccountStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN'

export const CA202000_POLICY: ScreenStatePolicy<BankAccountStatus> = {
  states: {
    ACTIVE: {
      editable: true,
      fields: {
        accountNumber: { readonly: true },
        currency: { readonly: true },
        status: { readonly: true },
      },
    },
    INACTIVE: {
      editable: true,
      actionRequiredLabel: 'Activate',
      fields: {
        accountNumber: { readonly: true },
        currency: { readonly: true },
        status: { readonly: true },
        isDefault: { readonly: true },
      },
    },
    FROZEN: {
      editable: false,
      actionRequiredLabel: 'Account Frozen — Contact Admin',
    },
  },
}
