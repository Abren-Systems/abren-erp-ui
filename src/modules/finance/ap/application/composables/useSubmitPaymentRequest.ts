import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { apKeys } from '../keys'
import type { PaymentRequestId } from '@/shared/types/brand.types'

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
export function useSubmitPaymentRequest(id: MaybeRefOrGetter<PaymentRequestId>) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: submit,
    isPending,
    error,
  } = useApiMutation<void>(
    async () => {
      const unwrappedId = toValue(id)
      if (!unwrappedId) throw new Error('Missing Payment Request ID')
      await apAdapter.submitRequest(unwrappedId)
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

  return { submit, isPending, error }
}
