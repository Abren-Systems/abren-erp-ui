import { useQuery } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/adapter'
import { APMapper } from '../../infrastructure/mappers'

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
