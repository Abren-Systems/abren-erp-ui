import { useApiQuery } from '@/shared/composables/useApiQuery'
import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
import { LedgerMapper } from '../../infrastructure/mappers'
import type { JournalEntry } from '../../domain/journal-entry.types'
import type { components } from '@/shared/api/generated.types'

type JournalEntryCreate = components['schemas']['JournalEntryCreate']

/**
 * Use Case: Manage Journal Entries.
 *
 * Provides access to the list of journal entries and allows
 * creating and posting new entries.
 */
export function useJournalEntries() {
  const queryClient = useQueryClient()

  const {
    data: entries,
    isLoading,
    error,
    refetch,
  } = useApiQuery<JournalEntry[]>(['journal-entries'], async () => {
    const dtos = await ledgerAdapter.getJournalEntries()
    return dtos.map((dto) => LedgerMapper.toJournalEntry(dto))
  })

  const { mutateAsync: createEntry, isPending: isCreating } = useApiMutation<
    JournalEntry,
    Error,
    JournalEntryCreate
  >(
    async (data: JournalEntryCreate) => {
      const dto = await ledgerAdapter.createJournalEntry(data)
      return LedgerMapper.toJournalEntry(dto)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      },
    },
  )

  const { mutateAsync: postEntry, isPending: isPosting } = useApiMutation<void, Error, string>(
    async (id: string) => {
      await ledgerAdapter.postJournalEntry(id)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
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
