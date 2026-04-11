import { useApiQuery } from '@/shared/composables/useApiQuery'
import type { VendorBillId } from '@/shared/types/brand.types'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { APMapper } from '../../infrastructure/mappers'
import { apKeys } from '../keys'

/**
 * Use Case: View a Single Vendor Bill.
 *
 * Fetches and maps a specific vendor bill by ID.
 *
 * @param id - The unique identifier of the vendor bill.
 * @returns Reactive vendor bill state.
 * @example
 * const { bill, isLoading } = useVendorBill(toId<VendorBillId>('bill_123'))
 */
export function useVendorBill(id: VendorBillId) {
  const {
    data: bill,
    isLoading,
    error,
  } = useApiQuery(
    apKeys.vendorBill(id),
    async () => {
      const dto = await apAdapter.getBill(id)
      return APMapper.toVendorBill(dto)
    },
    { staleTime: 1000 * 30 }, // 30 seconds
  )

  return { bill, isLoading, error }
}
