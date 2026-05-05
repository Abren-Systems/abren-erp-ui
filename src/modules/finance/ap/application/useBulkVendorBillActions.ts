import { ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { apAdapter } from '../infrastructure/ap_adapter'
import { apKeys } from './query-keys'
import type { VendorBillId } from '@/shared/types/brand.types'

export type BulkResult = {
  id: VendorBillId
  status: 'fulfilled' | 'rejected'
  error?: string
}

export function useBulkVendorBillActions() {
  const queryClient = useQueryClient()
  const isPending = ref(false)
  const results = ref<BulkResult[]>([])
  const successCount = ref(0)
  const failureCount = ref(0)

  function computeCounts(res: BulkResult[]) {
    successCount.value = res.filter((r) => r.status === 'fulfilled').length
    failureCount.value = res.filter((r) => r.status === 'rejected').length
  }

  async function validateMultiple(ids: VendorBillId[]): Promise<BulkResult[]> {
    isPending.value = true
    results.value = []
    const currentResults: BulkResult[] = []

    for (const id of ids) {
      try {
        await apAdapter.validateBill(id)
        currentResults.push({ id, status: 'fulfilled' })
      } catch (err: unknown) {
        currentResults.push({
          id,
          status: 'rejected',
          error: err instanceof Error ? err.message : 'Validation failed',
        })
      }
    }

    void queryClient.invalidateQueries({ queryKey: apKeys.vendorBills() })
    results.value = currentResults
    isPending.value = false
    return currentResults
  }

  async function rejectMultiple(ids: VendorBillId[], reason: string): Promise<BulkResult[]> {
    isPending.value = true
    results.value = []
    const currentResults: BulkResult[] = []

    for (const id of ids) {
      try {
        await apAdapter.rejectBill(id, reason)
        currentResults.push({ id, status: 'fulfilled' })
      } catch (err: unknown) {
        currentResults.push({
          id,
          status: 'rejected',
          error: err instanceof Error ? err.message : 'Rejection failed',
        })
      }
    }

    void queryClient.invalidateQueries({ queryKey: apKeys.vendorBills() })
    results.value = currentResults
    isPending.value = false
    return currentResults
  }

  return {
    validateMultiple,
    rejectMultiple,
    isPending,
    results,
    successCount,
    failureCount,
    computeCounts,
  }
}
