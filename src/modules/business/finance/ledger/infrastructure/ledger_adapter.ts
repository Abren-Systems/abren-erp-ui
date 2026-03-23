import { apiGet, apiPost } from '@/core/api/http-client'
import type { Account } from '../domain/account.types'
import { mapAccount } from './ledger.mapper'
import type { components } from '@/core/api/generated.types'

type AccountRead = components['schemas']['AccountRead']
type JournalEntryRead = components['schemas']['JournalEntryRead']
type JournalEntryCreate = components['schemas']['JournalEntryCreate']

/**
 * Ledger API Adapter
 */
export const ledgerAdapter = {
  /**
   * Fetches the accounts and maps them via the ACL Mapper
   */
  async getAccounts(): Promise<Account[]> {
    const dtos = await apiGet<AccountRead[]>('/finance/ledger/accounts')
    return dtos.map(mapAccount)
  },

  async getJournalEntries(): Promise<JournalEntryRead[]> {
    // For now, JE might stay as DTO until we define the JE entity
    return apiGet<JournalEntryRead[]>('/finance/ledger/journal-entries')
  },

  async createJournalEntry(data: JournalEntryCreate): Promise<JournalEntryRead> {
    return apiPost<JournalEntryRead>('/finance/ledger/journal-entries', data)
  },

  async postJournalEntry(entryId: string): Promise<JournalEntryRead> {
    return apiPost<JournalEntryRead>(`/finance/ledger/journal-entries/${entryId}/post`)
  },
}
