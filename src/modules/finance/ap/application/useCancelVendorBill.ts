import { toast } from 'vue-sonner'
import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'
import type { ApiError } from '@/shared/api/http-client'
import type { VendorBillId } from '@/shared/types/brand.types'
import type { VendorBill } from '../models/ap.types'

/**
 * Use Case: Cancel a Vendor Bill.
 *
 * Transitions a vendor bill to CANCELLED state with a reason.
 * Supports reactive IDs.
 *
 * @param id - The unique identifier (or Ref/Getter) of the vendor bill.
 * @returns Reactive cancel state and mutate function.
 */
export function useCancelVendorBill(id: MaybeRefOrGetter<VendorBillId>) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: cancel,
    isPending,
    error,
  } = useApiMutation<VendorBill, ApiError, string>(
    async (reason: string) => {
      const unwrappedId = toValue(id)
      if (!unwrappedId) throw new Error('Missing Vendor Bill ID')
      return await apAdapter.cancelBill(unwrappedId, reason)
    },
    {
      onSuccess: (data: VendorBill) => {
        const unwrappedId = toValue(id)
        toast.success('Vendor Bill Cancelled', {
          description: `Bill ${data.billNumber} has been cancelled.`,
        })
        void queryClient.invalidateQueries({
          queryKey: apKeys.vendorBill(unwrappedId),
        })
        void queryClient.invalidateQueries({
          queryKey: apKeys.vendorBills(),
        })
      },
      onError: (err: ApiError) => {
        toast.error('Cancellation Failed', {
          description: err.message || 'An unexpected error occurred.',
        })
      },
    },
  )

  return { cancel, isPending, error }
}
