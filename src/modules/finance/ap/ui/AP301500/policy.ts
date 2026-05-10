import type { ScreenStatePolicy } from '@/platform/screen-runtime'
import type { PaymentRequestStatus } from '../../domain/ap.types'

// ── AP301500 Screen State Policy ──────────────────────────
// Declares how the Payment Request Entry screen renders in each domain state.
// This is the frontend equivalent of Acumatica's WithFieldStates() in the
// Workflow API — one file, one source of truth.
//
// Commands (which buttons appear) → commands.ts
// Presentation (which fields are editable/required) → this file

/** Field keys for PaymentRequest that have state-dependent behavior */
type PRFieldKey =
  | 'requesterId'
  | 'beneficiaryId'
  | 'status'
  | 'submittedAt'
  | 'justification'
  | 'currency'
  | 'totalAmount'

export const AP301500_POLICY: ScreenStatePolicy<PaymentRequestStatus, PRFieldKey> = {
  states: {
    DRAFT: {
      editable: true,
      actionRequiredLabel: 'Submit for Approval',
      sections: {
        approval_history: { hidden: true },
      },
      fields: {
        requesterId: { readonly: true },
        status: { readonly: true },
        submittedAt: { readonly: true, hidden: true },
        totalAmount: { readonly: true },
        beneficiaryId: { required: true },
        justification: { required: true },
        currency: { required: true },
      },
    },
    SUBMITTED: {
      editable: false,
      actionRequiredLabel: 'Review & Approve',
      banner: {
        messageKey: 'This request is pending approval.',
        variant: 'info',
      },
    },
    APPROVED: {
      editable: false,
      actionRequiredLabel: 'Authorize Payment',
    },
    REJECTED: {
      editable: true,
      actionRequiredLabel: 'Edit & Resubmit',
      banner: {
        messageKey: 'This request was rejected. Please review comments and resubmit.',
        variant: 'danger',
      },
      fields: {
        requesterId: { readonly: true },
        status: { readonly: true },
        submittedAt: { readonly: true },
        totalAmount: { readonly: true },
        beneficiaryId: { required: true },
        justification: { required: true },
        currency: { required: true },
      },
    },
    AUTHORIZED: {
      editable: false,
    },
    CANCELLED: {
      editable: false,
    },
    PAID: {
      editable: false,
    },
  },
}
