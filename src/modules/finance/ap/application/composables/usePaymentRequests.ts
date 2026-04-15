import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { apKeys } from '../keys'

/**
 * Use Case: View Payment Requests List.
 *
 * Fetches and maps all standalone payment requests.
 *
 * @returns Reactive payment requests collection and refetch function.
 * @example
 * const { requests, isLoading } = usePaymentRequests()
 */
export function usePaymentRequests() {
  const {
    data: requests,
    isLoading,
    error,
    refetch,
  } = useResourceQuery(apKeys.paymentRequests(), () => apAdapter.listRequests())

  return { requests, isLoading, error, refetch }
}
