import { apiGet, apiPost } from '@/shared/api/http-client'
import type {
  AccountDTO,
  AccountCreateDTO,
  AccountRenameDTO,
  JournalEntryDTO,
  JournalEntryCreateDTO,
  JournalEntryVoidDTO,
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
} from './api.schemas'

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
   * Creates a new GL account.
   *
   * @param data - The account creation data.
   * @returns A promise resolving to the validated AccountDTO.
   */
  async createAccount(data: AccountCreateDTO): Promise<AccountDTO> {
    const raw = await apiPost<AccountDTO>('/finance/ledger/accounts', data)
    return AccountSchema.parse(raw)
  },

  /**
   * Deactivates a GL account by ID.
   *
   * @param accountId - The UUID of the account to deactivate.
   * @returns A promise resolving to the validated AccountDTO.
   */
  async deactivateAccount(accountId: string): Promise<AccountDTO> {
    const raw = await apiPost<AccountDTO>(`/finance/ledger/accounts/${accountId}/deactivate`)
    return AccountSchema.parse(raw)
  },

  /**
   * Renames a GL account.
   *
   * @param accountId - The UUID of the account to rename.
   * @param data - The rename payload.
   * @returns A promise resolving to the validated AccountDTO.
   */
  async renameAccount(accountId: string, data: AccountRenameDTO): Promise<AccountDTO> {
    const raw = await apiPost<AccountDTO>(`/finance/ledger/accounts/${accountId}/rename`, data)
    return AccountSchema.parse(raw)
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
   * Fetches a single journal entry by ID.
   *
   * @param entryId - The UUID of the journal entry.
   * @returns A promise resolving to the validated JournalEntryDTO.
   */
  async getJournalEntry(entryId: string): Promise<JournalEntryDTO> {
    const raw = await apiGet<JournalEntryDTO>(`/finance/ledger/journal-entries/${entryId}`)
    return JournalEntrySchema.parse(raw)
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
   * Voids a posted journal entry.
   *
   * @param entryId - The UUID of the journal entry to void.
   * @param data - The void payload containing the reason.
   * @returns A promise resolving to the validated JournalEntryDTO.
   */
  async voidJournalEntry(entryId: string, data: JournalEntryVoidDTO): Promise<JournalEntryDTO> {
    const raw = await apiPost<JournalEntryDTO>(
      `/finance/ledger/journal-entries/${entryId}/void`,
      data,
    )
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
