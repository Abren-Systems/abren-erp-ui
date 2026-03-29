import { Money } from '@/core/domain/money'
import { Currency } from '@/core/domain/currency'
import type { VendorBillDTO, VendorBillLineDTO } from '../../infrastructure/api.types'
import type { VendorBill, VendorBillLine } from '../models/vendor-bill.types'

export class VendorBillMapper {
  static toDomainMode(dto: VendorBillLineDTO, parentCurrencyStr: string): VendorBillLine {
    const parentCurrency = Object.values(Currency).includes(parentCurrencyStr as Currency)
      ? (parentCurrencyStr as Currency)
      : Currency.USD

    return {
      id: dto.id,
      description: dto.description,
      amount: Money.from(dto.amount, parentCurrency),
      accountId: dto.account_id ?? null,
      categoryId: dto.category_id ?? null,
      journalLineId: dto.journal_line_id ?? null,
    }
  }

  static toDomain(dto: VendorBillDTO): VendorBill {
    const lines = dto.lines.map((ln) => this.toDomainMode(ln, dto.currency))

    return {
      id: dto.id,
      vendorId: dto.vendor_id,
      billNumber: dto.bill_number,
      issueDate: new Date(dto.issue_date),
      dueDate: new Date(dto.due_date),
      currency: dto.currency,
      justification: dto.justification,
      status: dto.status,
      totalAmount: Money.from(dto.total_amount, dto.currency as Currency),
      lines,
    }
  }
}
