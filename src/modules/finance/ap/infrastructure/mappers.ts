import { Money } from '@/shared/domain/money'
import { Currency } from '@/shared/domain/currency'
import type {
  PaymentRequestDTO,
  PaymentRequestLineDTO,
  VendorBillDTO,
  VendorBillLineDTO,
} from './api.types'
import type {
  PaymentRequest,
  PaymentRequestLine,
  PaymentRequestStatus,
  VendorBill,
  VendorBillLine,
} from '../domain/ap.types'
import type { PaymentRequestId, VendorBillId } from '@/shared/types/brand.types'
import { toId } from '@/shared/types/brand.types'

/**
 * Accounts Payable Mapper-as-Factory.
 *
 * Handles transformations for Payment Requests and Vendor Bills.
 */
export class APMapper {
  // --- Payment Request Mappers ---

  /**
   * Transforms a raw Payment Request Line DTO into a Domain Model.
   */
  private static mapPRLine(
    lineDto: PaymentRequestLineDTO,
    parentCurrency: string,
  ): PaymentRequestLine {
    const currency = Object.values(Currency).includes(parentCurrency as Currency)
      ? (parentCurrency as Currency)
      : Currency.USD

    return {
      id: lineDto.id,
      description: lineDto.description,
      amount: Money.from(lineDto.amount, currency),
      accountId: lineDto.account_id,
      categoryId: lineDto.category_id,
      taxAmount: lineDto.tax_amount != null ? Money.from(lineDto.tax_amount, currency) : null,
    }
  }

  /**
   * Transforms a raw Payment Request DTO into a Domain Model.
   */
  static toPaymentRequest(dto: PaymentRequestDTO): PaymentRequest {
    return {
      id: toId<PaymentRequestId>(dto.id),
      requesterId: dto.requester_id,
      beneficiaryId: dto.beneficiary_id,
      totalAmount: Money.from(dto.total_amount, dto.currency as Currency),
      currency: dto.currency as Currency,
      justification: dto.justification,
      status: dto.status as PaymentRequestStatus,
      lines: dto.lines.map((ln) => this.mapPRLine(ln, dto.currency)),
      bankAccountId: dto.bank_account_id,
      targetLiabilityAccountId: dto.target_liability_account_id,
      submittedAt: dto.submitted_at ? new Date(dto.submitted_at) : null,
      paidAt: dto.paid_at ? new Date(dto.paid_at) : null,
      currentApprovalStep: dto.current_approval_step,
      assignedApproverId: dto.assigned_approver_id,
      sourceModule: dto.source_module,
      sourceId: dto.source_id,
    }
  }

  // --- Vendor Bill Mappers ---

  /**
   * Transforms a raw Vendor Bill Line DTO into a Domain Model.
   */
  private static mapVendorBillLine(
    dto: VendorBillLineDTO,
    parentCurrencyStr: string,
  ): VendorBillLine {
    const currency = Object.values(Currency).includes(parentCurrencyStr as Currency)
      ? (parentCurrencyStr as Currency)
      : Currency.USD

    return {
      id: dto.id,
      description: dto.description,
      amount: Money.from(dto.amount, currency),
      accountId: dto.account_id ?? null,
      categoryId: dto.category_id ?? null,
      journalLineId: dto.journal_line_id ?? null,
    }
  }

  /**
   * Transforms a raw Vendor Bill DTO into a Domain Model.
   */
  static toVendorBill(dto: VendorBillDTO): VendorBill {
    const lines = dto.lines.map((ln) => this.mapVendorBillLine(ln, dto.currency))

    return {
      id: toId<VendorBillId>(dto.id),
      vendorId: dto.vendor_id,
      billNumber: dto.bill_number,
      issueDate: new Date(dto.issue_date),
      dueDate: new Date(dto.due_date),
      currency: dto.currency as Currency,
      justification: dto.justification,
      status: dto.status,
      totalAmount: Money.from(dto.total_amount, dto.currency as Currency),
      lines,
    }
  }
}
