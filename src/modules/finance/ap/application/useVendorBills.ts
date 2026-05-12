import { toValue, type MaybeRefOrGetter } from 'vue'
import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'

import type { ListQuery } from '@/shared/domain/pagination'

/**
 * Use Case: View Vendor Bills List.
 *
 * @param {MaybeRefOrGetter<ListQuery>} [query] - Optional pagination parameters.
 */
export function useVendorBills(query?: MaybeRefOrGetter<ListQuery>) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useResourceQuery(apKeys.vendorBills(query), () => apAdapter.listBills(toValue(query)))

  return {
    vendorBills: response,
    isLoading,
    error,
    refetch,
  }
}
