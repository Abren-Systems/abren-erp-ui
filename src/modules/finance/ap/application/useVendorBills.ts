import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'

import type { ListQuery } from '@/shared/domain/pagination'

/**
 * Use Case: View Vendor Bills List.
 *
 * Fetches and maps supplier invoices (Vendor Bills) with keyset pagination support.
 *
 * @param {ListQuery} [query] - Optional pagination and filter parameters.
 * @returns Reactive paginated vendor bills collection.
 */
export function useVendorBills(query?: ListQuery) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useResourceQuery(apKeys.vendorBills(query), () => apAdapter.listBills(query))

  return {
    vendorBills: response,
    isLoading,
    error,
    refetch,
  }
}
