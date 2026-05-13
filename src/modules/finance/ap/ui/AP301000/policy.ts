import type { ScreenStatePolicy } from '@/platform/screen-runtime'

/** Field keys for VendorBill that have state-dependent behavior */
type BillFieldKey =
  | 'vendorId'
  | 'billNumber'
  | 'vendorInvoiceNumber'
  | 'issueDate'
  | 'dueDate'
  | 'currency'
  | 'justification'
  | 'status'

export const AP301000_POLICY: ScreenStatePolicy<string, BillFieldKey> = {
  states: {
    DRAFT: {
      actionRequiredLabel: 'Validate Bill',
      fields: {
        status: { readonly: true },
      },
    },
    VALIDATED: {
      actionRequiredLabel: 'Ready for Accrual',
      banner: {
        messageKey: 'This bill has been validated and taxes have been calculated.',
        variant: 'info',
      },
      fields: {
        vendorId: { readonly: true },
        billNumber: { readonly: true },
        vendorInvoiceNumber: { readonly: true },
        issueDate: { readonly: true },
        dueDate: { readonly: true },
        currency: { readonly: true },
        justification: { readonly: true },
        status: { readonly: true },
      },
    },
    CANCELLED: {
      banner: {
        messageKey: 'This bill has been cancelled.',
        variant: 'danger',
      },
      fields: {
        vendorId: { readonly: true },
        billNumber: { readonly: true },
        vendorInvoiceNumber: { readonly: true },
        issueDate: { readonly: true },
        dueDate: { readonly: true },
        currency: { readonly: true },
        justification: { readonly: true },
        status: { readonly: true },
      },
    },
  },
}
