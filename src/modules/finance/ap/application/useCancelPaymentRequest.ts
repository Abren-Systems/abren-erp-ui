import { toast } from 'vue-sonner'
import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import { apAdapter } from '../infrastructure/ap.adapter'
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
      onSuccess: (data: PaymentRequest) => {
        const unwrappedId = toValue(id)
        toast.success('Payment Request Cancelled', {
          description: `Request ${data.requestNumber} has been cancelled.`,
        })
        void queryClient.invalidateQueries({
          queryKey: apKeys.paymentRequest(unwrappedId),
        })
        void queryClient.invalidateQueries({
          queryKey: apKeys.paymentRequests(),
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
