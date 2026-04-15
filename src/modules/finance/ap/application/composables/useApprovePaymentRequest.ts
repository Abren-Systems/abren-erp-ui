import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { apKeys } from '../keys'

/**
 * Use Case: Approve a Payment Request.
 *
 * Initiates the approval transition for a pending payment request.
 * Supports reactive IDs.
 *
 * @param id - The unique identifier (or Ref/Getter) of the payment request.
 * @returns Reactive approval state and mutate function.
 * @example
 * const { approve, isPending } = useApprovePaymentRequest(() => selectedId.value)
 */
export function useApprovePaymentRequest(id: MaybeRefOrGetter<PaymentRequestId>) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: approve,
    isPending,
    error,
  } = useApiMutation<PaymentRequest>(
    async (_: void) => {
      const unwrappedId = toValue(id)
      if (!unwrappedId) throw new Error('Missing Payment Request ID')
      return await apAdapter.approveRequest(unwrappedId)
    },
    {
      onSuccess: () => {
        const unwrappedId = toValue(id)
        void queryClient.invalidateQueries({
          queryKey: apKeys.paymentRequest(unwrappedId),
        })
        void queryClient.invalidateQueries({
          queryKey: apKeys.paymentRequests(),
        })
      },
    },
  )

  return { approve, isPending, error }
}
