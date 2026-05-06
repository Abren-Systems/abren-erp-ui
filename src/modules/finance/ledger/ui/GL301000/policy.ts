import type { ScreenStatePolicy } from '@/platform/screen-runtime'

/**
 * GL301000 — Journal Entry State Policy
 *
 * | State  | Editable | Notes                                       |
 * |--------|----------|---------------------------------------------|
 * | DRAFT  | ✅       | Full edit — preparing entry for posting       |
 * | POSTED | ❌       | Immutable ledger record — can only void       |
 * | VOIDED | ❌       | Terminal — no further actions                 |
 */

export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'VOIDED'

export const GL301000_POLICY: ScreenStatePolicy<JournalEntryStatus> = {
  states: {
    DRAFT: {
      editable: true,
      actionRequiredLabel: 'Post Entry',
      fields: {
        entryNumber: { readonly: true },
        status: { readonly: true },
        description: { required: true },
        entryDate: { required: true },
      },
    },
    POSTED: {
      editable: false,
      actionRequiredLabel: 'Review or Void',
    },
    VOIDED: {
      editable: false,
    },
  },
}
