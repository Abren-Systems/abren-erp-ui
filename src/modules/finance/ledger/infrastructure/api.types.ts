import type { components } from '@/shared/api/generated.types'

export type AccountDTO = components['schemas']['AccountRead']
export type AccountCreateDTO = components['schemas']['AccountCreate']
export type AccountRenameDTO = components['schemas']['AccountRename']
export type JournalEntryDTO = components['schemas']['JournalEntryRead']
export type JournalEntryCreateDTO = components['schemas']['JournalEntryCreate']
export type JournalEntryVoidDTO = components['schemas']['JournalEntryVoid']
export type FiscalPeriodDTO = components['schemas']['FiscalPeriodRead']
export type FiscalPeriodCreateDTO = components['schemas']['FiscalPeriodCreate']
export type LedgerSettingsDTO = components['schemas']['LedgerSettingsRead']
export type LedgerSettingsUpdateDTO = components['schemas']['LedgerSettingsUpdate']
