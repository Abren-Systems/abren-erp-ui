import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { apKeys } from '../keys'
import type { ApiError } from '@/shared/api/http-client'

/**
 * Use Case: Reject a Payment Request.
 *
 * Rejects a submitted payment request with a mandatory reason.
 * Supports reactive IDs.
 *
 * @param id - The unique identifier (or Ref/Getter) of the payment request.
 * @returns Reactive rejection state and mutate function.
 * @example
 * const { reject, isPending } = useRejectPaymentRequest(() => selectedId.value)
 */
export function useRejectPaymentRequest(id: MaybeRefOrGetter<PaymentRequestId>) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: reject,
    isPending,
    error,
  } = useApiMutation<void, ApiError, string>(
    async (reason: string) => {
      const unwrappedId = toValue(id)
      if (!unwrappedId) throw new Error('Missing Payment Request ID')
      await apAdapter.rejectRequest(unwrappedId, { reason })
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

  return { reject, isPending, error }
}
