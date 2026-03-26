import { Money } from '@/core/domain/money'
import type { PaymentRequestDTO } from '../../infrastructure/api.types'
import type { PaymentRequest, PaymentRequestLine } from '../models/payment-request.types'

function mapLine(lineDto: PaymentRequestDTO['lines'][number]): PaymentRequestLine {
  return {
    id: lineDto.id,
    description: lineDto.description,
    amount: Money.from(lineDto.amount, 'ETB'), // currency resolved from header
    accountId: lineDto.account_id,
    categoryId: lineDto.category_id,
    taxAmount: lineDto.tax_amount != null ? Money.from(lineDto.tax_amount, 'ETB') : null,
  }
}

export function mapToPaymentRequest(dto: PaymentRequestDTO): PaymentRequest {
  return {
    id: dto.id,
    requesterId: dto.requester_id,
    beneficiaryId: dto.beneficiary_id,
    totalAmount: Money.from(dto.total_amount, dto.currency),
    currency: dto.currency,
    justification: dto.justification,
    status: dto.status,
    lines: dto.lines.map(mapLine),
    bankAccountId: dto.bank_account_id,
    targetLiabilityAccountId: dto.target_liability_account_id,
    submittedAt: dto.submitted_at ? new Date(dto.submitted_at) : null,
    paidAt: dto.paid_at ? new Date(dto.paid_at) : null,
    currentApprovalStep: dto.current_approval_step,
    assignedApproverId: dto.assigned_approver_id,
  }
}
