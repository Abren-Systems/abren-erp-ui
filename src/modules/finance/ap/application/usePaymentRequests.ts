import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'

import type { ListQuery } from '@/shared/domain/pagination'

/**
 * Use Case: View Payment Requests List.
 *
 * Fetches and maps standalone payment requests with keyset pagination support.
 *
 * @param {ListQuery} [query] - Optional pagination and filter parameters.
 * @returns Reactive paginated payment requests collection.
 */
export function usePaymentRequests(query?: ListQuery) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useResourceQuery(apKeys.paymentRequests(query), () => apAdapter.listRequests(query))

  return {
    requests: response, // Now returns ListResponse<PaymentRequest>
    isLoading,
    error,
    refetch,
  }
}
