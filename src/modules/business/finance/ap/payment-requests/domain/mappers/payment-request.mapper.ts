import { Money } from '@/core/domain/money'
import type { PaymentRequestDTO } from '../../infrastructure/api.types'
import type { PaymentRequest, PaymentRequestStatus } from '../models/payment-request.types'

export function mapToPaymentRequest(dto: PaymentRequestDTO): PaymentRequest {
  return {
    id: dto.id,
    beneficiaryId: dto.beneficiary_id,
    amount: Money.from(dto.amount, dto.currency),
    justification: dto.justification,
    status: dto.status as PaymentRequestStatus,
    bankAccountId: dto.bank_account_id,
    submittedAt: dto.submitted_at ? new Date(dto.submitted_at) : null,
    approvedAt: dto.approved_at ? new Date(dto.approved_at) : null,
    paidAt: dto.paid_at ? new Date(dto.paid_at) : null,
  }
}
