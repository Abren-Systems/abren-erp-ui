import type { components } from '@/shared/api/generated.types'

export type AccountDTO = components['schemas']['AccountDTO']
export type AccountCreateDTO = components['schemas']['CreateAccountDTO']
export type AccountRenameDTO = components['schemas']['RenameAccountDTO']
export type JournalEntryDTO = components['schemas']['JournalEntryDTO']
export type JournalEntryCreateDTO = components['schemas']['CreateJournalEntryDTO']
export type JournalEntryVoidDTO = components['schemas']['VoidJournalEntryDTO']
export type FiscalPeriodDTO = components['schemas']['FiscalPeriodDTO']
export type FiscalPeriodCreateDTO = components['schemas']['CreateFiscalPeriodDTO']
export type LedgerSettingsDTO = components['schemas']['LedgerSettingsDTO']
export type LedgerSettingsUpdateDTO = components['schemas']['UpdateLedgerSettingsDTO']
