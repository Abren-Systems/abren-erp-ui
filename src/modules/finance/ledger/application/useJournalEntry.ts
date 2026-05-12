import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { useQueryClient } from '@tanstack/vue-query'
import { ledgerAdapter } from '../infrastructure/ledger.adapter'
import { ledgerKeys } from './query-keys'
import type { ApiError } from '@/shared/api/http-client'
import type { JournalEntry } from '../models/journal-entry.types'
import type { OperationalEntity } from '@/platform/workflow-runtime/models/workflows.types'
import type { JournalEntryId } from '@/shared/types/brand.types'

/**
 * Use Case: Focus on a single Journal Entry.
 *
 * Powers Stage 2 of the Progressive Disclosure flow (the Detail/Focus Canvas).
 * Provides the entry, state-advancing mutations (post, void), and a loading state
 * that consolidates all async operations.
 *
 * @param entryId - The branded ID of the journal entry to manage.
 * @returns Reactive single-entry state and management methods.
 *
 * @example
 * const { journalEntry, postEntry, voidEntry, isLoading } = useJournalEntry(props.entryId)
 */
export function useJournalEntry(entryId: JournalEntryId) {
  const queryClient = useQueryClient()

  const {
    data: journalEntry,
    isLoading: isFetching,
    error,
    refetch,
  } = useResourceQuery(ledgerKeys.journalEntry(entryId), () =>
    ledgerAdapter.getJournalEntry(entryId),
  )

  /**
   * State-Advancing Action: DRAFT → POSTED.
   * This is a Primary action on the DetailPage Action Surface.
   */
  const { mutateAsync: postEntry, isPending: isPosting } = useApiMutation<
    OperationalEntity<JournalEntry>,
    ApiError,
    void
  >(
    async () => {
      const version = journalEntry.value?.__operations?.version ?? 1
      return await ledgerAdapter.postJournalEntry(entryId, version)
    },
    {
      onSuccess: (updated: OperationalEntity<JournalEntry>) => {
        // Update the single-entry cache immediately for instant UI feedback
        queryClient.setQueryData(ledgerKeys.journalEntry(entryId), updated)
        // Invalidate the list so the list reflects the state change
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
    OperationalEntity<JournalEntry>,
    ApiError,
    { reason: string }
  >(
    async ({ reason }) => {
      const version = journalEntry.value?.__operations?.version ?? 1
      return await ledgerAdapter.voidJournalEntry(entryId, { reason, expected_version: version })
    },
    {
      onSuccess: (updated: OperationalEntity<JournalEntry>) => {
        queryClient.setQueryData(ledgerKeys.journalEntry(entryId), updated)
        void queryClient.invalidateQueries({
          queryKey: ledgerKeys.journalEntries(),
        })
      },
    },
  )

  return {
    journalEntry,
    isLoading: isFetching || isPosting || isVoiding,
    error,
    refetch,
    postEntry,
    voidEntry,
  }
}
