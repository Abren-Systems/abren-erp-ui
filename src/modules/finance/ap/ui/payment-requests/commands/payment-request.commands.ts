import type { PaymentRequestStatus } from '../../../domain/ap.types'

export interface ScreenAction {
  key: string
  label: string
  variant: 'primary' | 'danger' | 'neutral'
  enabled: boolean
  requiresConfirmation?: boolean
  description?: string // Description to show in the confirmation dialog
}

/**
 * Derives the available screen actions based on the current aggregate status.
 * This will eventually be replaced by the ScreenRuntime's command resolver.
 */
export function getPaymentRequestActions(status?: PaymentRequestStatus): ScreenAction[] {
  if (!status) return []
  const list: ScreenAction[] = []

  if (status === 'DRAFT' || status === 'REJECTED') {
    list.push({
      key: 'submit',
      label: 'Submit',
      variant: 'primary',
      enabled: true,
      requiresConfirmation: true,
      description: 'Submit this request for approval?',
    })
  }
  if (status === 'SUBMITTED') {
    list.push({
      key: 'approve',
      label: 'Approve',
      variant: 'primary',
      enabled: true,
      requiresConfirmation: true,
      description: 'Approve this payment request?',
    })
    list.push({
      key: 'reject',
      label: 'Reject',
      variant: 'danger',
      enabled: true,
      requiresConfirmation: true,
      description: 'Reject this payment request?',
    })
  }
  if (status === 'APPROVED') {
    list.push({
      key: 'authorize',
      label: 'Authorize',
      variant: 'primary',
      enabled: true,
      requiresConfirmation: true,
      description: 'Authorize this payment?',
    })
  }
  if (status === 'DRAFT' || status === 'SUBMITTED') {
    list.push({
      key: 'cancel',
      label: 'Cancel',
      variant: 'danger',
      enabled: true,
      requiresConfirmation: true,
      description: 'Cancel this request permanently?',
    })
  }
  return list
}
