import { useApiMutation } from '@/core/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { vendorBillsAdapter } from '../../infrastructure/vendor_bills_adapter'
import { VendorBillMapper } from '../../domain/mappers/vendor-bill.mapper'

import type { VendorBill } from '../../domain/models/vendor-bill.types'

export function useValidateVendorBill() {
  const queryClient = useQueryClient()

  const mutation = useApiMutation(
    async (id: string) => {
      const dto = await vendorBillsAdapter.validate(id)
      return VendorBillMapper.toDomain(dto)
    },
    {
      onSuccess: (validatedBill: VendorBill) => {
        void queryClient.setQueryData(['vendor-bills', validatedBill.id], validatedBill)
        void queryClient.invalidateQueries({ queryKey: ['vendor-bills'] })
      },
    },
  )

  return { validate: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error }
}
