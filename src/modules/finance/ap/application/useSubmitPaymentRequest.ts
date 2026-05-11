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
 * Use Case: Submit a Payment Request for Approval.
 *
 * Transitions a draft payment request to the submitted state,
 * initiating the workflow. Supports reactive IDs.
 *
 * @param id - The unique identifier (or Ref/Getter) of the payment request.
 * @returns Reactive submission state and mutate function.
 * @example
 * const { submit, isPending } = useSubmitPaymentRequest(() => selectedId.value)
 */
export function useSubmitPaymentRequest(
  id: MaybeRefOrGetter<PaymentRequestId>,
  version: OccVersionSource,
) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: submit,
    isPending,
    error,
  } = useApiMutation<PaymentRequest>(
    async () => {
      const unwrappedId = toValue(id)
      if (!unwrappedId) throw new Error('Missing Payment Request ID')
      return await apAdapter.submitRequest(unwrappedId, resolveOccVersion(version))
    },
    {
      onSuccess: (data: PaymentRequest) => {
        const unwrappedId = toValue(id)
        toast.success('Payment Request Submitted', {
          description: `Request ${data.requestNumber} has been submitted for approval.`,
        })
        void queryClient.invalidateQueries({
          queryKey: apKeys.paymentRequest(unwrappedId),
        })
        void queryClient.invalidateQueries({
          queryKey: apKeys.paymentRequests(),
        })
      },
      onError: (err: ApiError) => {
        toast.error('Submission Failed', {
          description: err.message || 'An unexpected error occurred.',
        })
      },
    },
  )

  return { submit, isPending, error }
}
