import { apiGet, apiGetEnvelope, apiPost, apiPostEnvelope } from '@/shared/api/http-client'
import type { ListQuery, ListResponse } from '@/shared/domain/pagination'
import type { OperationalEntity } from '@/platform/workflow-runtime/models/workflows.types'
import { mapOperational, mapOperationalList } from '@/platform/workflow-runtime/utils/operational'
import type { JournalEntry } from '../models/journal-entry.types'
import { LedgerMapper } from './mappers'
import type {
  AccountDTO,
  CreateAccountDTO,
  RenameAccountDTO,
  JournalEntryDTO,
  CreateJournalEntryDTO,
  VoidJournalEntryDTO,
  FiscalPeriodDTO,
  FiscalYearDTO,
  GenerateFiscalYearDTO,
  LedgerSettingsDTO,
  UpdateLedgerSettingsDTO,
} from './api.types'
import {
  OperationalAccountSchema,
  OperationalJournalEntrySchema,
  JournalEntryListSchema,
  OperationalFiscalPeriodSchema,
  OperationalFiscalYearSchema,
  OperationalLedgerSettingsSchema,
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
  async getAccounts(): Promise<OperationalEntity<AccountDTO>[]> {
    const raw = (await apiGet<unknown[]>('/finance/ledger/accounts')) as unknown[]
    return raw.map((item) => {
      const parsed = OperationalAccountSchema.parse(item)
      return mapOperational(parsed, (data) => data)
    })
  },

  /**
   * Creates a new GL account.
   *
   * @param data - The account creation data.
   * @returns A promise resolving to the validated AccountDTO.
   */
  async createAccount(data: CreateAccountDTO): Promise<OperationalEntity<AccountDTO>> {
    const raw = await apiPostEnvelope<unknown>('/finance/ledger/accounts', data)
    const parsed = OperationalAccountSchema.parse(raw)
    return mapOperational(parsed, (data) => data)
  },

  /**
   * Deactivates a GL account by ID.
   *
   * @param accountId - The UUID of the account to deactivate.
   * @returns A promise resolving to the validated AccountDTO.
   */
  async deactivateAccount(accountId: string): Promise<OperationalEntity<AccountDTO>> {
    const raw = await apiPostEnvelope<unknown>(`/finance/ledger/accounts/${accountId}/deactivate`)
    const parsed = OperationalAccountSchema.parse(raw)
    return mapOperational(parsed, (data) => data)
  },

  /**
   * Renames a GL account.
   *
   * @param accountId - The UUID of the account to rename.
   * @param data - The rename payload.
   * @returns A promise resolving to the validated AccountDTO.
   */
  async renameAccount(
    accountId: string,
    data: RenameAccountDTO,
  ): Promise<OperationalEntity<AccountDTO>> {
    const raw = await apiPostEnvelope<unknown>(`/finance/ledger/accounts/${accountId}/rename`, data)
    const parsed = OperationalAccountSchema.parse(raw)
    return mapOperational(parsed, (data) => data)
  },

  /**
   * Fetches a paginated list of journal entries.
   */
  async getJournalEntries(
    query?: ListQuery,
  ): Promise<ListResponse<OperationalEntity<JournalEntry>>> {
    const raw = await apiGetEnvelope<unknown>('/finance/ledger/journal-entries', {
      params: query,
      headers: { 'X-Abren-Response-Profile': 'summary' },
    })
    const parsed = JournalEntryListSchema.parse(raw.data)

    return mapOperationalList(parsed, (item) =>
      LedgerMapper.toJournalEntry(item as JournalEntryDTO),
    )
  },

  /**
   * Fetches a single journal entry by ID.
   *
   * @param entryId - The UUID of the journal entry.
   * @returns A promise resolving to the validated Domain Model and Operations.
   */
  async getJournalEntry(entryId: string): Promise<OperationalEntity<JournalEntry>> {
    const raw = await apiGetEnvelope<unknown>(`/finance/ledger/journal-entries/${entryId}`, {
      headers: { 'X-Abren-Response-Profile': 'operational' },
    })
    const parsed = OperationalJournalEntrySchema.parse(raw)
    return mapOperational(parsed, (data) => LedgerMapper.toJournalEntry(data))
  },

  /**
   * Creates a new draft journal entry.
   *
   * @param data - The raw journal entry creation data.
   */
  async createJournalEntry(data: CreateJournalEntryDTO): Promise<OperationalEntity<JournalEntry>> {
    const raw = await apiPostEnvelope<unknown>('/finance/ledger/journal-entries', data, {
      headers: { 'X-Abren-Response-Profile': 'operational' },
    })
    const parsed = OperationalJournalEntrySchema.parse(raw)
    return mapOperational(parsed, (data) => LedgerMapper.toJournalEntry(data))
  },

  /**
   * Posts an existing draft journal entry to the ledger.
   *
   * @param entryId - The unique identifier of the journal entry.
   * @param version - The OCC expected version.
   */
  async postJournalEntry(
    entryId: string,
    version: number,
  ): Promise<OperationalEntity<JournalEntry>> {
    const raw = await apiPostEnvelope<unknown>(
      `/finance/ledger/journal-entries/${entryId}/post`,
      { expected_version: version },
      { headers: { 'X-Abren-Response-Profile': 'operational' } },
    )
    const parsed = OperationalJournalEntrySchema.parse(raw)
    return mapOperational(parsed, (data) => LedgerMapper.toJournalEntry(data))
  },

  /**
   * Voids a posted journal entry.
   *
   * @param entryId - The UUID of the journal entry to void.
   * @param data - The void payload containing the reason and expected version.
   */
  async voidJournalEntry(
    entryId: string,
    data: VoidJournalEntryDTO & { expected_version: number },
  ): Promise<OperationalEntity<JournalEntry>> {
    const raw = await apiPostEnvelope<unknown>(
      `/finance/ledger/journal-entries/${entryId}/void`,
      data,
      {
        headers: { 'X-Abren-Response-Profile': 'operational' },
      },
    )
    const parsed = OperationalJournalEntrySchema.parse(raw)
    return mapOperational(parsed, (data) => LedgerMapper.toJournalEntry(data))
  },

  /**
   * Fetches the list of all fiscal years.
   *
   * @returns A promise resolving to an array of validated FiscalYearDTOs.
   */
  async getFiscalYears(): Promise<OperationalEntity<FiscalYearDTO>[]> {
    const raw = (await apiGet<unknown[]>('/finance/ledger/fiscal-years')) as unknown[]
    return raw.map((item) => {
      const parsed = OperationalFiscalYearSchema.parse(item)
      return mapOperational(parsed, (data) => data)
    })
  },

  /**
   * Fetches the list of all fiscal periods.
   *
   * @returns A promise resolving to an array of validated FiscalPeriodDTOs.
   */
  async getFiscalPeriods(): Promise<OperationalEntity<FiscalPeriodDTO>[]> {
    const raw = (await apiGet<unknown[]>('/finance/ledger/fiscal-periods')) as unknown[]
    return raw.map((item) => {
      const parsed = OperationalFiscalPeriodSchema.parse(item)
      return mapOperational(parsed, (data) => data)
    })
  },

  /**
   * Generates a new fiscal year with its constituent periods.
   *
   * @param data - The fiscal year generation data.
   * @returns A promise resolving to the validated FiscalYearDTO.
   */
  async generateFiscalYear(data: GenerateFiscalYearDTO): Promise<OperationalEntity<FiscalYearDTO>> {
    const raw = await apiPostEnvelope<unknown>('/finance/ledger/fiscal-years', data)
    const parsed = OperationalFiscalYearSchema.parse(raw)
    return mapOperational(parsed, (data) => data)
  },

  /**
   * Fetches the global ledger configuration/settings.
   *
   * @returns A promise resolving to the validated LedgerSettingsDTO.
   */
  async getLedgerSettings(): Promise<OperationalEntity<LedgerSettingsDTO>> {
    const raw = await apiGetEnvelope<unknown>('/finance/ledger/settings')
    const parsed = OperationalLedgerSettingsSchema.parse(raw)
    return mapOperational(parsed, (data) => data)
  },

  /**
   * Updates the global ledger configuration.
   *
   * @param data - The configuration update data (PATCH).
   * @returns A promise resolving to the validated LedgerSettingsDTO.
   */
  async updateLedgerSettings(
    data: UpdateLedgerSettingsDTO,
  ): Promise<OperationalEntity<LedgerSettingsDTO>> {
    const raw = await apiPostEnvelope<unknown>('/finance/ledger/settings', data, {
      method: 'PATCH',
    })
    const parsed = OperationalLedgerSettingsSchema.parse(raw)
    return mapOperational(parsed, (data) => data)
  },

  /**
   * Closes a financial period.
   */
  async closePeriod(periodId: string): Promise<void> {
    await apiPost(`/finance/ledger/periods/${periodId}/close`)
  },

  /**
   * Re-opens a financial period.
   */
  async openPeriod(periodId: string): Promise<void> {
    await apiPost(`/finance/ledger/periods/${periodId}/open`)
  },

  /**
   * Locks a financial period.
   */
  async lockPeriod(periodId: string): Promise<void> {
    await apiPost(`/finance/ledger/periods/${periodId}/lock`)
  },

  /**
   * Unlocks a financial period.
   */
  async unlockPeriod(periodId: string): Promise<void> {
    await apiPost(`/finance/ledger/periods/${periodId}/unlock`)
  },

  /**
   * Closes a financial year.
   */
  async closeYear(yearId: string): Promise<void> {
    await apiPost(`/finance/ledger/fiscal-years/${yearId}/close`)
  },

  /**
   * Re-opens a financial year.
   */
  async openYear(yearId: string): Promise<void> {
    await apiPost(`/finance/ledger/fiscal-years/${yearId}/open`)
  },

  /**
   * Locks a financial year.
   */
  async lockYear(yearId: string): Promise<void> {
    await apiPost(`/finance/ledger/fiscal-years/${yearId}/lock`)
  },

  /**
   * Unlocks a financial year.
   */
  async unlockYear(yearId: string): Promise<void> {
    await apiPost(`/finance/ledger/fiscal-years/${yearId}/unlock`)
  },
}
