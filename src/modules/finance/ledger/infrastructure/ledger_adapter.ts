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
import {
  AccountSchema,
  JournalEntrySchema,
  FiscalPeriodSchema,
  LedgerSettingsSchema,
} from './schemas'

/**
 * Ledger API Adapter.
 *
 * Provides typed HTTP methods for interacting with the General Ledger backend.
 * All responses are shielded by Zod schemas to ensure runtime integrity.
 */
export const ledgerAdapter = {
  /**
   * Fetches the list of all Ledger accounts.
   *
   * @returns A promise resolving to an array of validated AccountDTOs.
   */
  async getAccounts(): Promise<AccountDTO[]> {
    const raw = (await apiGet<AccountDTO[]>('/finance/ledger/accounts')) as unknown[]
    return raw.map((item) => AccountSchema.parse(item))
  },

  /**
   * Fetches all recorded journal entries.
   *
   * @returns A promise resolving to an array of validated JournalEntryDTOs.
   */
  async getJournalEntries(): Promise<JournalEntryDTO[]> {
    const raw = (await apiGet<JournalEntryDTO[]>('/finance/ledger/journal-entries')) as unknown[]
    return raw.map((item) => JournalEntrySchema.parse(item))
  },

  /**
   * Creates a new draft journal entry.
   *
   * @param data - The raw journal entry creation data.
   * @returns A promise resolving to the validated JournalEntryDTO.
   */
  async createJournalEntry(data: JournalEntryCreateDTO): Promise<JournalEntryDTO> {
    const raw = await apiPost<JournalEntryDTO>('/finance/ledger/journal-entries', data)
    return JournalEntrySchema.parse(raw)
  },

  /**
   * Posts an existing draft journal entry to the ledger.
   *
   * @param entryId - The unique identifier of the journal entry.
   * @returns A promise resolving to the validated JournalEntryDTO.
   */
  async postJournalEntry(entryId: string): Promise<JournalEntryDTO> {
    const raw = await apiPost<JournalEntryDTO>(`/finance/ledger/journal-entries/${entryId}/post`)
    return JournalEntrySchema.parse(raw)
  },

  /**
   * Fetches the list of all fiscal periods.
   *
   * @returns A promise resolving to an array of validated FiscalPeriodDTOs.
   */
  async getFiscalPeriods(): Promise<FiscalPeriodDTO[]> {
    const raw = (await apiGet<FiscalPeriodDTO[]>('/finance/ledger/fiscal-periods')) as unknown[]
    return raw.map((item) => FiscalPeriodSchema.parse(item))
  },

  /**
   * Creates a new fiscal period.
   *
   * @param data - The raw fiscal period creation data.
   * @returns A promise resolving to the validated FiscalPeriodDTO.
   */
  async createFiscalPeriod(data: FiscalPeriodCreateDTO): Promise<FiscalPeriodDTO> {
    const raw = await apiPost<FiscalPeriodDTO>('/finance/ledger/fiscal-periods', data)
    return FiscalPeriodSchema.parse(raw)
  },

  /**
   * Fetches the global ledger configuration/settings.
   *
   * @returns A promise resolving to the validated LedgerSettingsDTO.
   */
  async getLedgerSettings(): Promise<LedgerSettingsDTO> {
    const raw = await apiGet<LedgerSettingsDTO>('/finance/ledger/settings')
    return LedgerSettingsSchema.parse(raw)
  },

  /**
   * Updates the global ledger configuration.
   *
   * @param data - The configuration update data (PATCH).
   * @returns A promise resolving to the validated LedgerSettingsDTO.
   */
  async updateLedgerSettings(data: LedgerSettingsUpdateDTO): Promise<LedgerSettingsDTO> {
    const raw = await apiPost<LedgerSettingsDTO>('/finance/ledger/settings', data, {
      method: 'PATCH',
    })
    return LedgerSettingsSchema.parse(raw)
  },
}
