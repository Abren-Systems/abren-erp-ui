import type { components } from '@/shared/api/generated.types'
import { type Account, AccountType } from '../domain/account.types'
import {
  type AccountId,
  type JournalEntryId,
  type FiscalPeriodId,
  type JournalLineId,
  type UserId,
  type ValueDate,
  type CurrencyCode,
} from '@/shared/types/brand.types'
import { Currency, Money } from '@/shared/domain/money'
import { CommonMapper } from '@/shared/infrastructure/mappers'
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
      id: CommonMapper.toBrandedId<AccountId>(dto.id),
      code: String(dto.code), // Convert numeric code to string for UI
      name: dto.name,
      type: dto.account_type.toUpperCase() as AccountType,
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
      id: CommonMapper.toBrandedId<JournalLineId>(dto.id),
      accountId: CommonMapper.toBrandedId<AccountId>(dto.account_id),
      description: dto.description || '',
      debit: dto.is_debit
        ? CommonMapper.toMoney(parseFloat(dto.amount), currency)
        : Money.zero(currency),
      credit: !dto.is_debit
        ? CommonMapper.toMoney(parseFloat(dto.amount), currency)
        : Money.zero(currency),

      // FX Awareness & Traceability (Enriched in hardening session)
      originalAmount: dto.original_amount
        ? CommonMapper.toMoney(dto.original_amount, dto.original_currency || currency)
        : undefined,
      originalCurrency: (dto.original_currency as CurrencyCode) || undefined,
      baseAmount: dto.base_amount ? CommonMapper.toMoney(dto.base_amount, currency) : undefined,
      exchangeRate: dto.exchange_rate ? parseFloat(dto.exchange_rate) : undefined,
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
      id: CommonMapper.toBrandedId<JournalEntryId>(dto.id),
      entryNumber: dto.entry_number,
      status: dto.status as 'DRAFT' | 'POSTED' | 'VOIDED',
      entryDate: CommonMapper.toDate(dto.date) as unknown as ValueDate,
      description: dto.description,
      createdBy: CommonMapper.toBrandedId<UserId>('system'),
      lines: (dto.lines || []).map((ln) => this.mapJournalLine(ln)),
      createdAt: dto.created_at || new Date().toISOString(),
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
      id: CommonMapper.toBrandedId<FiscalPeriodId>(dto.id),
      name: dto.name,
      startDate: CommonMapper.toDate(dto.start_date) as unknown as ValueDate,
      endDate: CommonMapper.toDate(dto.end_date) as unknown as ValueDate,
      status: dto.status as FiscalPeriodStatus,
      isAdjustmentPeriod: false,
      createdAt: dto.created_at || new Date().toISOString(),
    }
  }
}
