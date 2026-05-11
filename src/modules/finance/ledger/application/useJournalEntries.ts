import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { useQueryClient } from '@tanstack/vue-query'
import { ledgerAdapter } from '../infrastructure/ledger.adapter'
import { LedgerMapper } from '../infrastructure/mappers'
import { ledgerKeys } from './query-keys'
import type { ApiError } from '@/shared/api/http-client'
import type { JournalEntry } from '../models/journal-entry.types'
import type { CreateJournalEntryDTO } from '../infrastructure/api.types'

import type { ListQuery } from '@/shared/domain/pagination'

/**
 * Use Case: Manage Journal Entries.
 *
 * Provides access to the paginated list of journal entries and allows
 * creating and posting new entries.
 *
 * @param {ListQuery} [query] - Optional pagination parameters.
 * @returns Reactive journal entries state and management methods.
 * @example
 * const { entries, createEntry, postEntry, isLoading } = useJournalEntries()
 */
export function useJournalEntries(query?: ListQuery) {
  const queryClient = useQueryClient()

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useResourceQuery(
    ledgerKeys.journalEntries(query),
    () => ledgerAdapter.getJournalEntries(query),
    (data) => ({
      ...data,
      items: data.items.map((dto) => LedgerMapper.toJournalEntry(dto)),
    }),
  )

  const { mutateAsync: createEntry, isPending: isCreating } = useApiMutation<
    JournalEntry,
    ApiError,
    CreateJournalEntryDTO
  >(
    async (data: CreateJournalEntryDTO) => {
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
    entries: response,
    isLoading: isLoading || isCreating || isPosting,
    error,
    refresh: refetch,
    createEntry,
    postEntry,
  }
}
