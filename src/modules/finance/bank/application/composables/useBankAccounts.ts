import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { bankAdapter } from '../../infrastructure/bank_adapter'
import { bankKeys } from '../keys'

/**
 * Use Case: View Bank Accounts.
 *
 * Fetches and maps all logical bank accounts for the tenant.
 */
export function useBankAccounts() {
  const {
    data: accounts,
    isPending,
    error,
    refetch,
  } = useResourceQuery(
    bankKeys.accounts(),
    () => bankAdapter.getBankAccounts(),
    (data) => data,
    { staleTime: 1000 * 60 * 5 }, // 5 minutes
  )

  return {
    accounts,
    isPending,
    error,
    refetch,
  }
}
