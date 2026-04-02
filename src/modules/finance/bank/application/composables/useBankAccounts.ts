import { useQuery } from '@tanstack/vue-query'
import { bankAdapter } from '../../infrastructure/bank_adapter'
import { BankMapper } from '../../infrastructure/mappers'
import type { BankAccount } from '../../domain/bank.types'
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
  } = useQuery<BankAccount[]>({
    queryKey: bankKeys.accounts(),
    queryFn: async () => {
      const dtos = await bankAdapter.getBankAccounts()
      return dtos.map((dto) => BankMapper.toBankAccount(dto))
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    accounts,
    isPending,
    error,
    refetch,
  }
}
