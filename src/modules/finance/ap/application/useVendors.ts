import { type MaybeRefOrGetter } from 'vue'
import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'

/**
 * Use Case: View Vendors List.
 * Currently returns the full list instead of paginated.
 */
export function useVendors(query?: MaybeRefOrGetter<unknown>) {
  const {
    data: vendors,
    isLoading,
    error,
  } = useResourceQuery(apKeys.vendors(query), () => apAdapter.listVendors())

  return {
    vendors,
    isLoading,
    error,
  }
}
