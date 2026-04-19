import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { apKeys } from '../keys'
import type { PaymentRequestStats } from '../../domain/ap.types'

/**
 * Use Case: View Payment Request Operational Statistics.
 *
 * Fetches counts of requests in various workflow states (Draft, Submitted, Approved, etc.)
 * to drive the "Operational Inlet" UX.
 */
export function usePaymentRequestStats() {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useResourceQuery<PaymentRequestStats>([...apKeys.all, 'stats'], () => apAdapter.getStats())

  return { stats, isLoading, error, refetch }
}
