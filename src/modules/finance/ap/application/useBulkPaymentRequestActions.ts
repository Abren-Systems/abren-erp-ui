import { ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'
import type { PaymentRequestId } from '@/shared/types/brand.types'

/**
 * Result for a single item in a multi-select action.
 */
export interface BulkActionResult {
  id: PaymentRequestId
  status: 'fulfilled' | 'rejected'
  error?: string
}

/**
 * Use Case: Multi-Select Single Actions for Payment Requests.
 *
 * This is NOT a batch endpoint — each item is processed individually
 * via `Promise.allSettled`. No atomicity guarantee. No combined
 * success semantics.
 *
 * The frontend does not own workflow orchestration. It delegates
 * individual actions and reports per-item results honestly.
 */
export function useBulkPaymentRequestActions() {
  const queryClient = useQueryClient()
  const isPending = ref(false)
  const results = ref<BulkActionResult[]>([])

  async function approveMultiple(ids: PaymentRequestId[]): Promise<BulkActionResult[]> {
    isPending.value = true
    results.value = []

    const settled = await Promise.allSettled(ids.map((id) => apAdapter.approveRequest(id)))

    const itemResults: BulkActionResult[] = settled.map((result, index) => ({
      id: ids[index]!,
      status: result.status,
      error:
        result.status === 'rejected'
          ? result.reason instanceof Error
            ? result.reason.message
            : 'Unknown error'
          : undefined,
    }))

    results.value = itemResults
    isPending.value = false

    void queryClient.invalidateQueries({ queryKey: apKeys.paymentRequests() })
    void queryClient.invalidateQueries({ queryKey: [...apKeys.all, 'stats'] })

    return itemResults
  }

  async function rejectMultiple(
    ids: PaymentRequestId[],
    reason: string,
  ): Promise<BulkActionResult[]> {
    isPending.value = true
    results.value = []

    const settled = await Promise.allSettled(
      ids.map((id) => apAdapter.rejectRequest(id, { reason })),
    )

    const itemResults: BulkActionResult[] = settled.map((result, index) => ({
      id: ids[index]!,
      status: result.status,
      error:
        result.status === 'rejected'
          ? result.reason instanceof Error
            ? result.reason.message
            : 'Unknown error'
          : undefined,
    }))

    results.value = itemResults
    isPending.value = false

    void queryClient.invalidateQueries({ queryKey: apKeys.paymentRequests() })
    void queryClient.invalidateQueries({ queryKey: [...apKeys.all, 'stats'] })

    return itemResults
  }

  const successCount = ref(0)
  const failureCount = ref(0)

  function computeCounts(itemResults: BulkActionResult[]) {
    successCount.value = itemResults.filter((r) => r.status === 'fulfilled').length
    failureCount.value = itemResults.filter((r) => r.status === 'rejected').length
  }

  return {
    approveMultiple,
    rejectMultiple,
    isPending,
    results,
    successCount,
    failureCount,
    computeCounts,
  }
}
