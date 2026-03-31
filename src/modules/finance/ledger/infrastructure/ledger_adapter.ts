import { apiGet, apiPost } from '@/shared/api/http-client'
import type {
  AccountDTO,
  JournalEntryDTO,
  JournalEntryCreateDTO,
  FiscalPeriodDTO,
  FiscalPeriodCreateDTO,
  LedgerSettingsDTO,
  LedgerSettingsUpdateDTO,
} from './api.types'

/**
 * Ledger API Adapter
 */
export const ledgerAdapter = {
  /**
   * Fetches the accounts
   */
  async getAccounts(): Promise<AccountDTO[]> {
    return apiGet<AccountDTO[]>('/finance/ledger/accounts')
  },

  async getJournalEntries(): Promise<JournalEntryDTO[]> {
    return apiGet<JournalEntryDTO[]>('/finance/ledger/journal-entries')
  },

  async createJournalEntry(data: JournalEntryCreateDTO): Promise<JournalEntryDTO> {
    return apiPost<JournalEntryDTO>('/finance/ledger/journal-entries', data)
  },

  async postJournalEntry(entryId: string): Promise<JournalEntryDTO> {
    return apiPost<JournalEntryDTO>(`/finance/ledger/journal-entries/${entryId}/post`)
  },

  // --- Fiscal Periods ---

  async getFiscalPeriods(): Promise<FiscalPeriodDTO[]> {
    return apiGet<FiscalPeriodDTO[]>('/finance/ledger/fiscal-periods')
  },

  async createFiscalPeriod(data: FiscalPeriodCreateDTO): Promise<FiscalPeriodDTO> {
    return apiPost<FiscalPeriodDTO>('/finance/ledger/fiscal-periods', data)
  },

  // --- Ledger Settings ---

  async getLedgerSettings(): Promise<LedgerSettingsDTO> {
    return apiGet<LedgerSettingsDTO>('/finance/ledger/settings')
  },

  async updateLedgerSettings(data: LedgerSettingsUpdateDTO): Promise<LedgerSettingsDTO> {
    return apiPost<LedgerSettingsDTO>('/finance/ledger/settings', data, { method: 'PATCH' })
  },
}
