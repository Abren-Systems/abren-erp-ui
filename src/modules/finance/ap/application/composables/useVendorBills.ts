import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { APMapper } from '../../infrastructure/mappers'
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
  } = useResourceQuery(
    apKeys.vendorBills(),
    () => apAdapter.listBills(),
    (dtos) => dtos.map((dto) => APMapper.toVendorBill(dto)),
  )

  return { bills, isLoading, error, refetch }
}
