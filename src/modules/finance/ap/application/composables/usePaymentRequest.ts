import { useApiQuery } from '@/shared/composables/useApiQuery'
import { type MaybeRefOrGetter, toValue, computed } from 'vue'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { APMapper } from '../../infrastructure/mappers'
import { apKeys } from '../keys'

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
      if (!unwrappedId) return null

      const dto = await apAdapter.getRequest(unwrappedId)
      return APMapper.toPaymentRequest(dto)
    },
    {
      // Enabled only if we have a valid ID
      enabled: computed(() => !!toValue(id)),
      staleTime: 1000 * 30, // 30 seconds
    },
  )

  return { request, isLoading, error }
}
