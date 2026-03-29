import { useQuery } from '@tanstack/vue-query'
import { vendorBillsAdapter } from '../../infrastructure/vendor_bills_adapter'
import { VendorBillMapper } from '../../domain/mappers/vendor-bill.mapper'

export function useVendorBill(id: string) {
  const {
    data: bill,
    isLoading,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: ['vendor-bills', id],
    queryFn: async () => {
      const dto = await vendorBillsAdapter.get(id)
      return VendorBillMapper.toDomain(dto)
    },
    staleTime: 1000 * 30, // 30 seconds
  })

  return { bill, isLoading, error, refresh }
}
