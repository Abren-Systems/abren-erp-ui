import { useApiQuery } from '@/shared/composables/useApiQuery'
import { type MaybeRefOrGetter, toValue, computed } from 'vue'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'

/**
 * Use Case: View a Single Payment Request.
 *
 * Fetches and maps a specific payment request by ID. Supports reactive IDs.
 *
 * @param id - The unique identifier (or Ref/Getter) of the payment request.
 * @returns Reactive payment request state.
 * @example
 * const { request, isLoading } = usePaymentRequest(() => props.id)
 */
export function usePaymentRequest(id: MaybeRefOrGetter<PaymentRequestId>) {
  const {
    data: request,
    isLoading,
    error,
  } = useApiQuery(
    // Reactive key ensures TanStack Query re-fetches when ID changes
    computed(() => apKeys.paymentRequest(toValue(id))),
    async () => {
      const unwrappedId = toValue(id)
      if (!unwrappedId || unwrappedId === 'new') return null
      return await apAdapter.getRequest(unwrappedId)
    },
    {
      // Enabled only if we have a valid ID that is not 'new'
      enabled: computed(() => {
        const unwrappedId = toValue(id)
        return !!unwrappedId && unwrappedId !== 'new'
      }),
      staleTime: 1000 * 30, // 30 seconds
    },
  )

  return {
    request: computed(() => request.value?.data),
    operations: computed(() => request.value?.operations),
    isLoading,
    error,
  }
}
