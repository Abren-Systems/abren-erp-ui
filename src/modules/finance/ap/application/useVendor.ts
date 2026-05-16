import { toValue, computed, type MaybeRefOrGetter } from 'vue'
import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { apKeys } from './query-keys'
import { apAdapter } from '../infrastructure/ap.adapter'
import type { VendorDTO } from '../infrastructure/api.types'
import type { OperationalEntity } from '@/platform/workflow-runtime/models/workflows.types'

/**
 * Use Case: View a Single Vendor.
 *
 * @param id - The unique identifier of the vendor.
 */
export function useVendor(id: MaybeRefOrGetter<string | null | undefined>) {
  const {
    data: vendor,
    isLoading,
    error,
  } = useResourceQuery<OperationalEntity<VendorDTO> | null>(
    () => {
      const unwrapped = toValue(id)
      return unwrapped ? apKeys.vendor(unwrapped) : ['vendors', 'none']
    },
    () => {
      const unwrapped = toValue(id)
      if (!unwrapped) return Promise.resolve(null)
      return apAdapter.getVendor(unwrapped)
    },
    undefined,
    {
      enabled: computed(() => !!toValue(id)),
    },
  )

  return {
    vendor,
    isLoading,
    error,
  }
}
