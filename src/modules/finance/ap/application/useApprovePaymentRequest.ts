import { toast } from 'vue-sonner'
import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import type { PaymentRequest } from '../models/ap.types'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'
import type { ApiError } from '@/shared/api/http-client'
import { resolveOccVersion, type OccVersionSource } from './occ'

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
export function useApprovePaymentRequest(
  id: MaybeRefOrGetter<PaymentRequestId>,
  version: OccVersionSource,
) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: approve,
    isPending,
    error,
  } = useApiMutation<PaymentRequest, ApiError, void>(
    async (_: void) => {
      const unwrappedId = toValue(id)
      if (!unwrappedId) throw new Error('Missing Payment Request ID')
      return await apAdapter.approveRequest(unwrappedId, resolveOccVersion(version))
    },
    {
      onSuccess: (data: PaymentRequest) => {
        const unwrappedId = toValue(id)
        toast.success('Payment Request Approved', {
          description: `Request ${data.requestNumber} has been approved.`,
        })
        void queryClient.invalidateQueries({
          queryKey: apKeys.paymentRequest(unwrappedId),
        })
        void queryClient.invalidateQueries({
          queryKey: apKeys.paymentRequests(),
        })
      },
      onError: (err: ApiError) => {
        toast.error('Approval Failed', {
          description: err.message || 'An unexpected error occurred.',
        })
      },
    },
  )

  return { approve, isPending, error }
}
