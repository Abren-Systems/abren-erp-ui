import type { components } from '@/shared/api/generated.types'

export type AccountDTO = components['schemas']['AccountRead']
export type CreateAccountDTO = components['schemas']['AccountCreate']
export type RenameAccountDTO = components['schemas']['AccountRename']
export type JournalEntryDTO = components['schemas']['JournalEntryRead']
export type CreateJournalEntryDTO = components['schemas']['JournalEntryCreate']
export type VoidJournalEntryDTO = components['schemas']['JournalEntryVoid']
export type FiscalPeriodDTO = components['schemas']['FiscalPeriodRead']
export type CreateFiscalPeriodDTO = components['schemas']['FiscalPeriodCreate']
export type LedgerSettingsDTO = components['schemas']['LedgerSettingsRead']
export type UpdateLedgerSettingsDTO = components['schemas']['LedgerSettingsUpdate']
