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
 * Ledger API Adapter.
 *
 * Provides typed HTTP methods for interacting with the General Ledger backend.
 */
export const ledgerAdapter = {
  /**
   * Fetches the list of all Ledger accounts.
   *
   * @returns A promise resolving to an array of AccountDTOs.
   */
  async getAccounts(): Promise<AccountDTO[]> {
    return apiGet<AccountDTO[]>('/finance/ledger/accounts')
  },

  /**
   * Fetches all recorded journal entries.
   *
   * @returns A promise resolving to an array of JournalEntryDTOs.
   */
  async getJournalEntries(): Promise<JournalEntryDTO[]> {
    return apiGet<JournalEntryDTO[]>('/finance/ledger/journal-entries')
  },

  /**
   * Creates a new draft journal entry.
   *
   * @param data - The raw journal entry creation data.
   * @returns A promise resolving to the created JournalEntryDTO.
   */
  async createJournalEntry(data: JournalEntryCreateDTO): Promise<JournalEntryDTO> {
    return apiPost<JournalEntryDTO>('/finance/ledger/journal-entries', data)
  },

  /**
   * Posts an existing draft journal entry to the ledger.
   *
   * @param entryId - The unique identifier of the journal entry.
   * @returns A promise resolving to the updated JournalEntryDTO.
   */
  async postJournalEntry(entryId: string): Promise<JournalEntryDTO> {
    return apiPost<JournalEntryDTO>(`/finance/ledger/journal-entries/${entryId}/post`)
  },

  /**
   * Fetches the list of all fiscal periods.
   *
   * @returns A promise resolving to an array of FiscalPeriodDTOs.
   */
  async getFiscalPeriods(): Promise<FiscalPeriodDTO[]> {
    return apiGet<FiscalPeriodDTO[]>('/finance/ledger/fiscal-periods')
  },

  /**
   * Creates a new fiscal period.
   *
   * @param data - The raw fiscal period creation data.
   * @returns A promise resolving to the created FiscalPeriodDTO.
   */
  async createFiscalPeriod(data: FiscalPeriodCreateDTO): Promise<FiscalPeriodDTO> {
    return apiPost<FiscalPeriodDTO>('/finance/ledger/fiscal-periods', data)
  },

  /**
   * Fetches the global ledger configuration/settings.
   *
   * @returns A promise resolving to the LedgerSettingsDTO.
   */
  async getLedgerSettings(): Promise<LedgerSettingsDTO> {
    return apiGet<LedgerSettingsDTO>('/finance/ledger/settings')
  },

  /**
   * Updates the global ledger configuration.
   *
   * @param data - The configuration update data (PATCH).
   * @returns A promise resolving to the updated LedgerSettingsDTO.
   */
  async updateLedgerSettings(data: LedgerSettingsUpdateDTO): Promise<LedgerSettingsDTO> {
    return apiPost<LedgerSettingsDTO>('/finance/ledger/settings', data, { method: 'PATCH' })
  },
}
