import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { apKeys } from '../keys'

/**
 * Use Case: View Vendor Bills List.
 *
 * Fetches and maps all supplier invoices (Vendor Bills).
 *
 * @returns Reactive vendor bills collection and refetch function.
 * @example
 * const { bills, isLoading } = useVendorBills()
 */
export function useVendorBills() {
  const {
    data: bills,
    isLoading,
    error,
    refetch,
  } = useResourceQuery(apKeys.vendorBills(), () => apAdapter.listBills())

  return { bills, isLoading, error, refetch }
}
