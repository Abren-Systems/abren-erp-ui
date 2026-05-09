import type { ScreenStatePolicy } from '@/platform/screen-runtime/screen-state-policy.types'
import { ARDocumentStatus } from '../../domain/invoice.schema'

/**
 * AR301000 State Policy
 *
 * Defines the deterministic capability rules for the AR Invoice screen.
 * Transitions in status trigger a 'Capability Churn' in the projection.
 */
export const ARInvoiceStatePolicy: ScreenStatePolicy<ARDocumentStatus> = {
  states: {
    Hold: {
      editable: true,
      deletable: true,
      banner: {
        messageKey: 'Document is on Hold.',
        variant: 'info',
      },
      fields: {
        customerId: { readonly: false, required: true },
        docDate: { readonly: false, required: true },
      },
    },
    Balanced: {
      editable: false,
      deletable: true,
      actionRequiredLabel: 'Release',
      banner: {
        messageKey: 'Document is Balanced and ready for release.',
        variant: 'info',
      },
      fields: {
        customerId: { readonly: true },
        docDate: { readonly: true },
      },
    },
    Released: {
      editable: false,
      deletable: false,
      banner: {
        messageKey: 'Document has been Released and is now read-only.',
        variant: 'info',
      },
      fields: {
        customerId: { readonly: true },
        docDate: { readonly: true },
        docAmount: { readonly: true },
      },
      sections: {
        financial: { hidden: false },
      },
    },
    // Fallbacks for other statuses
    Open: { editable: false, deletable: false },
    Closed: { editable: false, deletable: false },
    Voided: { editable: false, deletable: false },
    Scheduled: { editable: false, deletable: false },
  },
}
