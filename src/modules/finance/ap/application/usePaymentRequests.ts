import { toValue, type MaybeRefOrGetter } from 'vue'
import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'

import type { ListQuery } from '@/shared/domain/pagination'

/**
 * Use Case: View Payment Requests List.
 *
 * @param {MaybeRefOrGetter<ListQuery>} [query] - Optional pagination parameters.
 * @returns Reactive paginated payment requests collection.
 */
export function usePaymentRequests(query?: MaybeRefOrGetter<ListQuery>) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useResourceQuery(apKeys.paymentRequests(query), () => apAdapter.listRequests(toValue(query)))

  return {
    paymentRequests: response,
    isLoading,
    error,
    refetch,
  }
}
