import type { PaymentRequestStatus } from '../../domain/ap.types'

import type { ActionContract } from '@/platform/component-contracts'

/**
 * Derives the available screen actions based on the current aggregate status.
 * This will eventually be replaced by the ScreenRuntime's command resolver.
 */
export function getPaymentRequestActions(status?: PaymentRequestStatus): ActionContract[] {
  if (!status) return []
  const list: ActionContract[] = []

  if (status === 'DRAFT' || status === 'REJECTED') {
    list.push({
      key: 'submit',
      labelKey: 'Submit',
      variant: 'primary',
      enabled: true,
      requiresConfirmation: true,
      description: 'Submit this request for approval?',
    })
  }
  if (status === 'SUBMITTED') {
    list.push({
      key: 'approve',
      labelKey: 'Approve',
      variant: 'primary',
      enabled: true,
      requiresConfirmation: true,
      description: 'Approve this payment request?',
    })
    list.push({
      key: 'reject',
      labelKey: 'Reject',
      variant: 'danger',
      enabled: true,
      requiresConfirmation: true,
      description: 'Reject this payment request?',
    })
  }
  if (status === 'APPROVED') {
    list.push({
      key: 'authorize',
      labelKey: 'Authorize',
      variant: 'primary',
      enabled: true,
      requiresConfirmation: true,
      description: 'Authorize this payment?',
    })
  }
  if (status === 'DRAFT' || status === 'SUBMITTED') {
    list.push({
      key: 'cancel',
      labelKey: 'Cancel',
      variant: 'danger',
      enabled: true,
      requiresConfirmation: true,
      description: 'Cancel this request permanently?',
    })
  }
  return list
}
