import type { Money } from '@/core/domain/money'

export type PaymentRequestStatus = 'DRAFT' | 'AWAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID'

export interface PaymentRequest {
  id: string
  beneficiaryId: string
  amount: Money
  justification: string
  status: PaymentRequestStatus
  bankAccountId: string | null
  submittedAt: Date | null
  approvedAt: Date | null
  paidAt: Date | null
}
