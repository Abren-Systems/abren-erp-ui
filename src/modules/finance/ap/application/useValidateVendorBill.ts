import { toast } from 'vue-sonner'
import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import type { VendorBillId } from '@/shared/types/brand.types'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'
import type { VendorBill } from '../domain/ap.types'
import type { ApiError } from '@/shared/api/http-client'

/**
 * Use Case: Validate a Vendor Bill.
 *
 * Transitions a draft vendor bill to 'VALIDATED' status.
 *
 * @param id - The unique identifier of the vendor bill to validate.
 * @returns Mutation state and validate function.
 */
export function useValidateVendorBill(id: VendorBillId) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: validate,
    isPending,
    error,
  } = useApiMutation<VendorBill>(
    async () => {
      return await apAdapter.validateBill(id)
    },
    {
      onSuccess: (data: VendorBill) => {
        toast.success('Vendor Bill Validated', {
          description: `Bill ${data.billNumber} has been validated for payment.`,
        })
        void queryClient.invalidateQueries({ queryKey: apKeys.vendorBill(id) })
        void queryClient.invalidateQueries({ queryKey: apKeys.vendorBills() })
      },
      onError: (err: ApiError) => {
        toast.error('Validation Failed', {
          description: err.message || 'An unexpected error occurred.',
        })
      },
    },
  )

  return { validate, isPending, error }
}
