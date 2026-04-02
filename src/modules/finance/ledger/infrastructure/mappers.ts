import type { components } from '@/shared/api/generated.types'
import type { Account } from '../domain/account.types'
import {
  toId,
  type AccountId,
  type JournalEntryId,
  type FiscalPeriodId,
  type JournalLineId,
} from '@/shared/types/brand.types'
import { Currency, Money } from '@/shared/domain/money'
import { BusinessDate } from '@/shared/domain/business-date'
import type { JournalEntry, JournalEntryLine } from '../domain/journal-entry.types'
import type { FiscalPeriod, FiscalPeriodStatus } from '../domain/fiscal-period.types'

type AccountRead = components['schemas']['AccountRead']
type JournalEntryRead = components['schemas']['JournalEntryRead']
type JournalLineRead = components['schemas']['JournalLineRead']
type FiscalPeriodRead = components['schemas']['FiscalPeriodRead']

/**
 * Ledger Mapper-as-Factory.
 *
 * Provides high-integrity transformations from raw API DTOs into
 * frontend Domain Models for the General Ledger module.
 */
export class LedgerMapper {
  /**
   * Transforms a raw API Account DTO into a Domain Model.
   *
   * @param dto - The raw account data from the API.
   * @returns A clean Account domain model.
   */
  static toAccount(dto: AccountRead): Account {
    // Backend currently doesn't provide currency_code in AccountRead,
    // defaulting to functional currency (ETB) for now.
    const currency = Currency.ETB

    return {
      id: toId<AccountId>(dto.id),
      code: String(dto.code), // Convert numeric code to string for UI
      name: dto.name,
      type: dto.account_type.toLowerCase(),
      currency: currency,
      isActive: dto.is_active,
      balance: Money.zero(currency),
    }
  }

  /**
   * Transforms a raw API Journal Entry Line DTO into a Domain Model.
   *
   * @param dto - The raw journal entry line data from the API.
   * @returns A validated JournalEntryLine domain model.
   */
  private static mapJournalLine(dto: JournalLineRead): JournalEntryLine {
    const currency = (dto.currency as Currency) || Currency.ETB

    return {
      id: toId<JournalLineId>(dto.id),
      accountId: toId<AccountId>(dto.account_id),
      description: dto.description || '',
      debit: dto.is_debit ? Money.from(parseFloat(dto.amount), currency) : Money.zero(currency),
      credit: !dto.is_debit ? Money.from(parseFloat(dto.amount), currency) : Money.zero(currency),
    }
  }

  /**
   * Transforms a raw API Journal Entry DTO into a Domain Model.
   *
   * @param dto - The raw journal entry data from the API.
   * @returns A clean JournalEntry domain model.
   */
  static toJournalEntry(dto: JournalEntryRead): JournalEntry {
    return {
      id: toId<JournalEntryId>(dto.id),
      entryNumber: dto.entry_number,
      status: dto.status as 'DRAFT' | 'POSTED' | 'VOIDED',
      entryDate: BusinessDate.fromIso(dto.date),
      description: dto.description,
      createdBy: 'System', // Missing from DTO, defaulting
      lines: (dto.lines || []).map((ln) => this.mapJournalLine(ln)),
      createdAt: BusinessDate.today(), // Missing from DTO, defaulting
    }
  }

  /**
   * Transforms a raw API Fiscal Period DTO into a Domain Model.
   *
   * @param dto - The raw fiscal period data from the API.
   * @returns A clean FiscalPeriod domain model.
   */
  static toFiscalPeriod(dto: FiscalPeriodRead): FiscalPeriod {
    return {
      id: toId<FiscalPeriodId>(dto.id),
      name: dto.name,
      startDate: BusinessDate.fromIso(dto.start_date),
      endDate: BusinessDate.fromIso(dto.end_date),
      status: dto.status as FiscalPeriodStatus,
      isAdjustmentPeriod: false, // Missing from DTO
      createdAt: BusinessDate.today(), // Missing from DTO
    }
  }
}
