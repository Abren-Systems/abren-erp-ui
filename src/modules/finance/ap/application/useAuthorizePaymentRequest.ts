import { toast } from 'vue-sonner'
import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'
import type { ApiError } from '@/shared/api/http-client'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import type { PaymentRequest } from '../models/ap.types'
import { resolveOccVersion, type OccVersionSource } from './occ'

/**
 * Use Case: Authorize a Payment Request.
 *
 * Transitions an approved payment request to AUTHORIZED state.
 * Supports reactive IDs.
 *
 * @param id - The unique identifier (or Ref/Getter) of the payment request.
 * @returns Reactive authorize state and mutate function.
 */
export function useAuthorizePaymentRequest(
  id: MaybeRefOrGetter<PaymentRequestId>,
  version: OccVersionSource,
) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: authorize,
    isPending,
    error,
  } = useApiMutation<PaymentRequest, ApiError, void>(
    async () => {
      const unwrappedId = toValue(id)
      if (!unwrappedId) throw new Error('Missing Payment Request ID')
      return await apAdapter.authorizeRequest(unwrappedId, resolveOccVersion(version))
    },
    {
      onSuccess: (data: PaymentRequest) => {
        const unwrappedId = toValue(id)
        toast.success('Payment Authorized', {
          description: `Request ${data.requestNumber} has been authorized for payment.`,
        })
        void queryClient.invalidateQueries({
          queryKey: apKeys.paymentRequest(unwrappedId),
        })
        void queryClient.invalidateQueries({
          queryKey: apKeys.paymentRequests(),
        })
      },
      onError: (err: ApiError) => {
        toast.error('Authorization Failed', {
          description: err.message || 'An unexpected error occurred.',
        })
      },
    },
  )

  return { authorize, isPending, error }
}
