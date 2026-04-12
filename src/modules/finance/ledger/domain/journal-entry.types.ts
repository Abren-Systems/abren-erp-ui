import type {
  AccountId,
  JournalEntryId,
  JournalLineId,
  UserId,
  ValueDate,
  CurrencyCode,
} from '@/shared/types/brand.types'
import type { Money } from '@/shared/domain/money'

export interface JournalEntryLine {
  id: JournalLineId
  accountId: AccountId
  description: string
  debit: Money
  credit: Money
  // FX Awareness & Traceability
  originalAmount?: Money
  originalCurrency?: CurrencyCode
  baseAmount?: Money
  exchangeRate?: number
}

export interface JournalEntry {
  id: JournalEntryId
  entryNumber: string
  status: 'DRAFT' | 'POSTED' | 'VOIDED'
  entryDate: ValueDate
  description: string
  createdBy: UserId
  postedBy?: UserId
  lines: JournalEntryLine[]
  createdAt: string
}
