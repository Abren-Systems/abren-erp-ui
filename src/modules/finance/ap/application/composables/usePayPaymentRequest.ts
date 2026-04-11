import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import type { PaymentRequestPayDTO } from '../../infrastructure/api.types'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { apKeys } from '../keys'
import type { ApiError } from '@/shared/api/http-client'
import type { PaymentRequestId } from '@/shared/types/brand.types'

/**
 * Use Case: Record Payment for a Payment Request.
 *
 * Marks an approved payment request as paid, providing bank/ledger details.
 * Supports reactive IDs.
 *
 * @param id - The unique identifier (or Ref/Getter) of the payment request.
 * @returns Reactive payment state and mutate function.
 * @example
 * const { pay, isPending } = usePayPaymentRequest(() => selectedId.value)
 */
export function usePayPaymentRequest(id: MaybeRefOrGetter<PaymentRequestId>) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: pay,
    isPending,
    error,
  } = useApiMutation<void, ApiError, PaymentRequestPayDTO>(
    async (dto: PaymentRequestPayDTO) => {
      const unwrappedId = toValue(id)
      if (!unwrappedId) throw new Error('Missing Payment Request ID')
      await apAdapter.payRequest(unwrappedId, dto)
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

  return { pay, isPending, error }
}
