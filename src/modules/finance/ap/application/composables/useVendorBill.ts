import { useQuery } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { APMapper } from '../../infrastructure/mappers'

/**
 * Use Case: View a Single Vendor Bill.
 *
 * Fetches and maps a specific vendor bill by ID.
 *
 * @param id - The unique identifier of the vendor bill.
 * @returns Reactive vendor bill state.
 * @example
 * const { bill, isLoading } = useVendorBill('bill_123')
 */
export function useVendorBill(id: string) {
  const {
    data: bill,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['vendor-bills', id],
    queryFn: async () => {
      const dto = await apAdapter.getBill(id)
      return APMapper.toVendorBill(dto)
    },
    staleTime: 1000 * 30, // 30 seconds
  })

  return { bill, isLoading, error }
}
