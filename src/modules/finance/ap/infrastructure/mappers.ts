import { type Currency } from '@/shared/domain/money'
import { CommonMapper } from '@/shared/infrastructure/mappers'
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
  VendorBillStatus,
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
      id: CommonMapper.toBrandedId<PaymentRequestLineId>(lineDto.id),
      description: lineDto.description,
      amount: CommonMapper.toMoney(lineDto.amount, parentCurrency),
      accountId: lineDto.account_id
        ? CommonMapper.toBrandedId<AccountId>(lineDto.account_id)
        : null,
      categoryId: lineDto.category_id
        ? CommonMapper.toBrandedId<CategoryId>(lineDto.category_id)
        : null,
      taxAmount:
        lineDto.tax_amount != null
          ? CommonMapper.toMoney(lineDto.tax_amount, parentCurrency)
          : null,
    }
  }

  /**
   * Transforms a raw Payment Request DTO into a Domain Model.
   */
  static toPaymentRequest(dto: PaymentRequestDTO): PaymentRequest {
    const currency = dto.currency as Currency

    return {
      id: CommonMapper.toBrandedId<PaymentRequestId>(dto.id),
      requesterId: CommonMapper.toBrandedId<UserId>(dto.requester_id),
      beneficiaryId: CommonMapper.toBrandedId<UserId>(dto.beneficiary_id),
      totalAmount: CommonMapper.toMoney(dto.total_amount, currency),
      currency: currency,
      justification: dto.justification,
      status: dto.status as PaymentRequestStatus,
      lines: dto.lines.map((ln: PaymentRequestLineDTO) => this.mapPRLine(ln, currency)),
      bankAccountId: dto.bank_account_id
        ? CommonMapper.toBrandedId<BankAccountId>(dto.bank_account_id)
        : null,
      targetLiabilityAccountId: dto.target_liability_account_id
        ? CommonMapper.toBrandedId<AccountId>(dto.target_liability_account_id)
        : null,
      submittedAt: CommonMapper.toDate(dto.submitted_at),
      paidAt: CommonMapper.toDate(dto.paid_at),
      currentApprovalStep: dto.current_approval_step,
      assignedApproverId: dto.assigned_approver_id
        ? CommonMapper.toBrandedId<UserId>(dto.assigned_approver_id)
        : null,
      sourceModule: null,
      sourceId: null,
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
      id: dto.id ? CommonMapper.toBrandedId<VendorBillLineId>(dto.id) : undefined,
      description: dto.description,
      amount: CommonMapper.toMoney(dto.amount, parentCurrency),
      accountId: dto.account_id ? CommonMapper.toBrandedId<AccountId>(dto.account_id) : null,
      categoryId: dto.category_id ? CommonMapper.toBrandedId<CategoryId>(dto.category_id) : null,
      journalLineId: dto.journal_line_id
        ? CommonMapper.toBrandedId<JournalLineId>(dto.journal_line_id)
        : null,
    }
  }

  /**
   * Transforms a raw Vendor Bill DTO into a Domain Model.
   */
  static toVendorBill(dto: VendorBillDTO): VendorBill {
    const currency = dto.currency as Currency
    const lines = dto.lines.map((ln: VendorBillLineDTO) => this.mapVendorBillLine(ln, currency))

    return {
      id: CommonMapper.toBrandedId<VendorBillId>(dto.id),
      vendorId: CommonMapper.toBrandedId<VendorId>(dto.vendor_id),
      billNumber: dto.bill_number,
      issueDate: CommonMapper.toDate(dto.issue_date)!,
      dueDate: CommonMapper.toDate(dto.due_date)!,
      currency: currency,
      justification: dto.justification ?? '',
      status: dto.status as VendorBillStatus,
      totalAmount: CommonMapper.toMoney(dto.total_amount, currency),
      lines,
    }
  }
}
