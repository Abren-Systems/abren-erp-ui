import type { AccountId, JournalEntryId, JournalLineId } from '@/shared/types/brand.types'
import type { Money } from '@/shared/domain/money'
import type { IsoDate } from '@/shared/domain/business-date'

export interface JournalEntryLine {
  id: JournalLineId
  accountId: AccountId
  description: string
  debit: Money
  credit: Money
}

export interface JournalEntry {
  id: JournalEntryId
  entryNumber: string
  status: 'DRAFT' | 'POSTED' | 'VOIDED'
  entryDate: IsoDate
  description: string
  createdBy: string
  postedBy?: string
  lines: JournalEntryLine[]
  createdAt: IsoDate
}
