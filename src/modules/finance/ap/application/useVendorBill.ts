import { useApiQuery } from '@/shared/composables/useApiQuery'
import type { VendorBillId } from '@/shared/types/brand.types'
import { type MaybeRefOrGetter, toValue, computed } from 'vue'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'

/**
 * Use Case: View a Single Vendor Bill.
 *
 * @param id - The unique identifier of the vendor bill.
 */
export function useVendorBill(id: MaybeRefOrGetter<VendorBillId | null | undefined>) {
  const {
    data: bill,
    isLoading,
    error,
  } = useApiQuery(
    // Reactive key ensures TanStack Query re-fetches when ID changes
    computed(() => {
      const unwrapped = toValue(id)
      return unwrapped ? apKeys.vendorBill(unwrapped) : ['vendor-bills', 'none']
    }),
    async () => {
      const unwrappedId = toValue(id)
      if (!unwrappedId) return null
      return await apAdapter.getBill(unwrappedId)
    },
    {
      // Enabled only if we have a valid ID
      enabled: computed(() => !!toValue(id)),
      staleTime: 1000 * 30, // 30 seconds
    },
  )

  return {
    vendorBill: bill,
    operations: computed(() => bill.value?.__operations),
    isLoading,
    error,
  }
}
