import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { useQueryClient } from '@tanstack/vue-query'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
import { LedgerMapper } from '../../infrastructure/mappers'
import { ledgerKeys } from '../keys'
import type { ApiError } from '@/shared/api/http-client'
import type { JournalEntry } from '../../domain/journal-entry.types'

/**
 * Use Case: Focus on a single Journal Entry.
 *
 * Powers Stage 2 of the Progressive Disclosure flow (the Detail/Focus Canvas).
 * Provides the entry, state-advancing mutations (post, void), and a loading state
 * that consolidates all async operations.
 *
 * @param entryId - The UUID string of the journal entry to manage.
 * @returns Reactive single-entry state and management methods.
 *
 * @example
 * const { entry, postEntry, voidEntry, isLoading } = useJournalEntry(props.entryId)
 */
export function useJournalEntry(entryId: string) {
  const queryClient = useQueryClient()

  const {
    data: entry,
    isLoading: isFetching,
    error,
    refetch,
  } = useResourceQuery(
    ledgerKeys.journalEntry(entryId),
    () => ledgerAdapter.getJournalEntry(entryId),
    (dto) => LedgerMapper.toJournalEntry(dto),
  )

  /**
   * State-Advancing Action: DRAFT → POSTED.
   * This is a Primary action on the DetailPage Action Surface.
   */
  const { mutateAsync: postEntry, isPending: isPosting } = useApiMutation<
    JournalEntry,
    ApiError,
    void
  >(
    async () => {
      const dto = await ledgerAdapter.postJournalEntry(entryId)
      return LedgerMapper.toJournalEntry(dto)
    },
    {
      onSuccess: (updated) => {
        // Update the single-entry cache immediately for instant UI feedback
        queryClient.setQueryData(ledgerKeys.journalEntry(entryId), updated)
        // Invalidate the list so the queue reflects the state change
        void queryClient.invalidateQueries({
          queryKey: ledgerKeys.journalEntries(),
        })
      },
    },
  )

  /**
   * Tertiary Action: POSTED → VOIDED.
   * Requires a mandatory reason. Must be called after ActionModal confirmation.
   */
  const { mutateAsync: voidEntry, isPending: isVoiding } = useApiMutation<
    JournalEntry,
    ApiError,
    { reason: string }
  >(
    async ({ reason }) => {
      const dto = await ledgerAdapter.voidJournalEntry(entryId, { reason })
      return LedgerMapper.toJournalEntry(dto)
    },
    {
      onSuccess: (updated) => {
        queryClient.setQueryData(ledgerKeys.journalEntry(entryId), updated)
        void queryClient.invalidateQueries({
          queryKey: ledgerKeys.journalEntries(),
        })
      },
    },
  )

  return {
    entry,
    isLoading: isFetching || isPosting || isVoiding,
    error,
    refetch,
    postEntry,
    voidEntry,
  }
}
