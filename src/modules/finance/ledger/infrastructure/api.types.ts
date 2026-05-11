import type { components } from '@/shared/api/generated.types'
import type { OperationalResponse } from '@/platform/workflow-runtime/models/workflows.types'

export type AccountDTO = components['schemas']['AccountDTO']
export type CreateAccountDTO = components['schemas']['CreateAccountDTO']
export type RenameAccountDTO = components['schemas']['RenameAccountDTO']
export type JournalEntryDTO = components['schemas']['JournalEntryDTO']
export type OperationalJournalEntryDTO = OperationalResponse<JournalEntryDTO>
export type CreateJournalEntryDTO = components['schemas']['CreateJournalEntryDTO']
export type VoidJournalEntryDTO = components['schemas']['VoidJournalEntryDTO']
export type FiscalPeriodDTO = components['schemas']['FiscalPeriodDTO']
export type FiscalYearDTO = components['schemas']['FiscalYearDTO']
export type GenerateFiscalYearDTO = components['schemas']['GenerateFiscalYearDTO']
export type LedgerSettingsDTO = components['schemas']['LedgerSettingsDTO']
export type UpdateLedgerSettingsDTO = components['schemas']['UpdateLedgerSettingsDTO']
