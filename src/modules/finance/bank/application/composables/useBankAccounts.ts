import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { bankAdapter } from '../../infrastructure/bank_adapter'
import { BankMapper } from '../../infrastructure/mappers'
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
    (dtos) => dtos.map((dto) => BankMapper.toBankAccount(dto)),
    { staleTime: 1000 * 60 * 5 }, // 5 minutes
  )

  return {
    accounts,
    isPending,
    error,
    refetch,
  }
}
