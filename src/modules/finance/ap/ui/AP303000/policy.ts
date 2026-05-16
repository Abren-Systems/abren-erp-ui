import type { ScreenStatePolicy } from '@/platform/screen-runtime'

export type VendorFieldKey =
  | 'name'
  | 'tin'
  | 'trade_license_number'
  | 'has_tin_certificate'
  | 'has_valid_trade_license'
  | 'status'

export const AP303000_POLICY: ScreenStatePolicy<string, VendorFieldKey> = {
  states: {
    DRAFT: {
      editable: true,
      actionRequiredLabel: 'Save',
      sections: {
        approval_history: { hidden: true },
      },
      fields: {
        name: { required: true },
        status: { readonly: true },
      },
    },
    ACTIVE: {
      editable: true, // We allow editing vendors
      actionRequiredLabel: '',
      sections: {},
      fields: {
        name: { required: true },
        status: { readonly: true },
      },
    },
  },
}
