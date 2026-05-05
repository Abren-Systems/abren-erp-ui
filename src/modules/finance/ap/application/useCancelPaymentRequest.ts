import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import { apAdapter } from '../infrastructure/ap_adapter'
import { apKeys } from './query-keys'
import type { ApiError } from '@/shared/api/http-client'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import type { PaymentRequest } from '../domain/ap.types'

/**
 * Use Case: Cancel a Payment Request.
 *
 * Transitions a payment request to CANCELLED state with a reason.
 * Supports reactive IDs.
 *
 * @param id - The unique identifier (or Ref/Getter) of the payment request.
 * @returns Reactive cancel state and mutate function.
 */
export function useCancelPaymentRequest(id: MaybeRefOrGetter<PaymentRequestId>) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: cancel,
    isPending,
    error,
  } = useApiMutation<PaymentRequest, ApiError, string>(
    async (reason: string) => {
      const unwrappedId = toValue(id)
      if (!unwrappedId) throw new Error('Missing Payment Request ID')
      return await apAdapter.cancelRequest(unwrappedId, reason)
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

  return { cancel, isPending, error }
}
