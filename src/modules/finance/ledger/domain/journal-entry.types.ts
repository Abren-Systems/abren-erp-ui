import type { AccountId } from '@/shared/types/brand.types'
import type { Money } from '@/shared/domain/money'

export type JournalEntryId = string & { readonly __brand: 'JournalEntryId' }

export interface JournalEntryLine {
  id: string
  accountId: AccountId
  description: string
  debit: Money
  credit: Money
}

export interface JournalEntry {
  id: JournalEntryId
  entryNumber: string
  status: 'DRAFT' | 'POSTED' | 'VOIDED'
  entryDate: string
  description: string
  createdBy: string
  postedBy?: string
  lines: JournalEntryLine[]
  createdAt: string
}
