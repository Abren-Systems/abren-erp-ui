import { Money, Currency } from '@/shared/domain/money'
import { BusinessDate } from '@/shared/domain/business-date'
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
import type {
  PaymentRequestId,
  PaymentRequestLineId,
  VendorBillId,
  VendorBillLineId,
  UserId,
  AccountId,
  CategoryId,
  BankAccountId,
  JournalLineId,
  VendorId,
} from '@/shared/types/brand.types'
import { toId } from '@/shared/types/brand.types'

/**
 * Accounts Payable Mapper-as-Factory.
 *
 * Provides high-integrity transformations from raw API DTOs into
 * frontend Domain Models for the Accounts Payable module.
 */
export class APMapper {
  // --- Payment Request Mappers ---

  /**
   * Transforms a raw Payment Request Line DTO into a Domain Model.
   */
  private static mapPRLine(
    lineDto: PaymentRequestLineDTO,
    parentCurrency: Currency,
  ): PaymentRequestLine {
    return {
      id: toId<PaymentRequestLineId>(lineDto.id),
      description: lineDto.description,
      amount: Money.from(lineDto.amount, parentCurrency),
      accountId: lineDto.account_id ? toId<AccountId>(lineDto.account_id) : null,
      categoryId: lineDto.category_id ? toId<CategoryId>(lineDto.category_id) : null,
      taxAmount: lineDto.tax_amount != null ? Money.from(lineDto.tax_amount, parentCurrency) : null,
    }
  }

  /**
   * Transforms a raw Payment Request DTO into a Domain Model.
   */
  static toPaymentRequest(dto: PaymentRequestDTO): PaymentRequest {
    const currency = dto.currency as Currency

    return {
      id: toId<PaymentRequestId>(dto.id),
      requesterId: toId<UserId>(dto.requester_id),
      beneficiaryId: toId<UserId>(dto.beneficiary_id),
      totalAmount: Money.from(dto.total_amount, currency),
      currency: currency,
      justification: dto.justification,
      status: dto.status as PaymentRequestStatus,
      lines: dto.lines.map((ln) => this.mapPRLine(ln, currency)),
      bankAccountId: dto.bank_account_id ? toId<BankAccountId>(dto.bank_account_id) : null,
      targetLiabilityAccountId: dto.target_liability_account_id
        ? toId<AccountId>(dto.target_liability_account_id)
        : null,
      submittedAt: dto.submitted_at ? BusinessDate.fromIso(dto.submitted_at) : null,
      paidAt: dto.paid_at ? BusinessDate.fromIso(dto.paid_at) : null,
      currentApprovalStep: dto.current_approval_step,
      assignedApproverId: dto.assigned_approver_id ? toId<UserId>(dto.assigned_approver_id) : null,
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
    parentCurrency: Currency,
  ): VendorBillLine {
    return {
      id: dto.id ? toId<VendorBillLineId>(dto.id) : undefined,
      description: dto.description,
      amount: Money.from(dto.amount, parentCurrency),
      accountId: dto.account_id ? toId<AccountId>(dto.account_id) : null,
      categoryId: dto.category_id ? toId<CategoryId>(dto.category_id) : null,
      journalLineId: dto.journal_line_id ? toId<JournalLineId>(dto.journal_line_id) : null,
    }
  }

  /**
   * Transforms a raw Vendor Bill DTO into a Domain Model.
   */
  static toVendorBill(dto: VendorBillDTO): VendorBill {
    const currency = dto.currency as Currency
    const lines = dto.lines.map((ln) => this.mapVendorBillLine(ln, currency))

    return {
      id: toId<VendorBillId>(dto.id),
      vendorId: toId<VendorId>(dto.vendor_id),
      billNumber: dto.bill_number,
      issueDate: BusinessDate.fromIso(dto.issue_date),
      dueDate: BusinessDate.fromIso(dto.due_date),
      currency: currency,
      justification: dto.justification,
      status: dto.status,
      totalAmount: Money.from(dto.total_amount, currency),
      lines,
    }
  }
}
