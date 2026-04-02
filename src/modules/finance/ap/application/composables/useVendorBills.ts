import { useQuery } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { APMapper } from '../../infrastructure/mappers'

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
  } = useQuery({
    queryKey: ['vendor-bills'],
    queryFn: async () => {
      const dtos = await apAdapter.listBills()
      return dtos.map((dto) => APMapper.toVendorBill(dto))
    },
    staleTime: 1000 * 60, // 1 minute
  })

  return { bills, isLoading, error, refetch }
}
