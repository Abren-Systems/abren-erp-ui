import { useQuery } from '@tanstack/vue-query'
import { bankAdapter } from '../../infrastructure/bank_adapter'
import { BankMapper } from '../../infrastructure/mappers'
import type { BankAccount } from '../../domain/bank.types'

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
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const dtos = await bankAdapter.getBankAccounts()
      return dtos.map(BankMapper.toBankAccount)
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
