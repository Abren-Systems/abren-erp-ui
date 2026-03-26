import type { Money } from '@/core/domain/money'

export type PaymentRequestStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID'

export interface PaymentRequestLine {
  id: string
  description: string
  amount: Money
  accountId: string | null
  categoryId: string | null
  taxAmount: Money | null
}

export interface PaymentRequest {
  id: string
  requesterId: string
  beneficiaryId: string
  /** Computed total from all lines. */
  totalAmount: Money
  currency: string
  justification: string
  status: PaymentRequestStatus
  lines: PaymentRequestLine[]
  bankAccountId: string | null
  targetLiabilityAccountId: string | null
  submittedAt: Date | null
  paidAt: Date | null
  currentApprovalStep: number
  assignedApproverId: string | null
}
