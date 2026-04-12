import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { useQueryClient } from '@tanstack/vue-query'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
import { LedgerMapper } from '../../infrastructure/mappers'
import { ledgerKeys } from '../keys'
import type { ApiError } from '@/shared/api/http-client'
import type { JournalEntry } from '../../domain/journal-entry.types'
import type { components } from '@/shared/api/generated.types'

type JournalEntryCreate = components['schemas']['JournalEntryCreate']

/**
 * Use Case: Manage Journal Entries.
 *
 * Provides access to the list of journal entries and allows
 * creating and posting new entries.
 *
 * @returns Reactive journal entries state and management methods.
 * @example
 * const { entries, createEntry, postEntry, isLoading } = useJournalEntries()
 */
export function useJournalEntries() {
  const queryClient = useQueryClient()

  const {
    data: entries,
    isLoading,
    error,
    refetch,
  } = useResourceQuery(
    ledgerKeys.journalEntries(),
    () => ledgerAdapter.getJournalEntries(),
    (dtos) => dtos.map((dto) => LedgerMapper.toJournalEntry(dto)),
  )

  const { mutateAsync: createEntry, isPending: isCreating } = useApiMutation<
    JournalEntry,
    ApiError,
    JournalEntryCreate
  >(
    async (data: JournalEntryCreate) => {
      const dto = await ledgerAdapter.createJournalEntry(data)
      return LedgerMapper.toJournalEntry(dto)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: ledgerKeys.journalEntries(),
        })
      },
    },
  )

  const { mutateAsync: postEntry, isPending: isPosting } = useApiMutation<void, ApiError, string>(
    async (id: string) => {
      await ledgerAdapter.postJournalEntry(id)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: ledgerKeys.journalEntries(),
        })
      },
    },
  )

  return {
    entries,
    isLoading: isLoading || isCreating || isPosting,
    error,
    refresh: refetch,
    createEntry,
    postEntry,
  }
}
