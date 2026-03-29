import { useQuery } from '@tanstack/vue-query'
import { vendorBillsAdapter } from '../../infrastructure/vendor_bills_adapter'
import { VendorBillMapper } from '../../domain/mappers/vendor-bill.mapper'

export function useVendorBills() {
  const {
    data: bills,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vendor-bills'],
    queryFn: async () => {
      const dtos = await vendorBillsAdapter.list()
      return dtos.map((dto) => VendorBillMapper.toDomain(dto))
    },
    staleTime: 1000 * 60, // 1 minute
  })

  return { bills, isLoading, error, refresh: refetch }
}
