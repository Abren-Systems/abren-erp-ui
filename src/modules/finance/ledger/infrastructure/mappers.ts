import type { components } from '@/shared/api/generated.types'
import { type Account, AccountType } from '../models/account.types'
import type {
  AccountId,
  JournalEntryId,
  FiscalPeriodId,
  FiscalYearId,
  JournalLineId,
  UserId,
  ValueDate,
  CurrencyCode,
} from '@/shared/types/brand.types'
import { Currency, Money } from '@/shared/domain/money'
import { CommonMapper } from '@/shared/infrastructure/mappers'
import type { JournalEntry, JournalEntryLine } from '../models/journal-entry.types'
import type {
  FiscalPeriod,
  FiscalPeriodStatus,
  FiscalYear,
  FiscalYearStatus,
} from '../models/fiscal-calendar.types'

type AccountDTO = components['schemas']['AccountDTO']
type JournalEntryDTO = components['schemas']['JournalEntryDTO']
type JournalLineDTO = components['schemas']['JournalLineDTO']
type FiscalPeriodDTO = components['schemas']['FiscalPeriodDTO']
type FiscalYearDTO = components['schemas']['FiscalYearDTO']

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
  static toAccount(dto: AccountDTO): Account {
    // Backend currently doesn't provide currency_code in AccountDTO,
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
  private static mapJournalLine(dto: JournalLineDTO): JournalEntryLine {
    const currency = (dto.currency_code as Currency) || Currency.ETB

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
  static toJournalEntry(dto: JournalEntryDTO): JournalEntry {
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
  static toFiscalPeriod(dto: FiscalPeriodDTO): FiscalPeriod {
    return {
      id: CommonMapper.toBrandedId<FiscalPeriodId>(dto.id),
      fiscalYearId: CommonMapper.toBrandedId<FiscalYearId>(dto.fiscal_year_id),
      name: dto.name,
      startDate: CommonMapper.toDate(dto.start_date) as unknown as ValueDate,
      endDate: CommonMapper.toDate(dto.end_date) as unknown as ValueDate,
      status: dto.status as FiscalPeriodStatus,
      isAdjustmentPeriod: dto.is_adjustment_period,
      createdAt: dto.created_at || new Date().toISOString(),
    }
  }

  /**
   * Transforms a raw API Fiscal Year DTO into a Domain Model.
   *
   * @param dto - The raw fiscal year data from the API.
   * @returns A clean FiscalYear domain model.
   */
  static toFiscalYear(dto: FiscalYearDTO): FiscalYear {
    return {
      id: CommonMapper.toBrandedId<FiscalYearId>(dto.id),
      year: dto.year,
      startDate: CommonMapper.toDate(dto.start_date) as unknown as ValueDate,
      endDate: CommonMapper.toDate(dto.end_date) as unknown as ValueDate,
      status: dto.status as unknown as FiscalYearStatus,
      periods: (dto.periods || []).map((p: FiscalPeriodDTO) => this.toFiscalPeriod(p)),
      createdAt: dto.created_at || new Date().toISOString(),
    }
  }
}
