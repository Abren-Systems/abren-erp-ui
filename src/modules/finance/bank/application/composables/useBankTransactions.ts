import { useQuery } from '@tanstack/vue-query'
import { bankAdapter } from '../../infrastructure/bank_adapter'
import { BankMapper } from '../../infrastructure/mappers'
import type { BankTransaction } from '../../domain/bank.types'
import type { BankAccountId } from '@/shared/types/brand.types'
import { computed } from 'vue'
import { bankKeys } from '../keys'

/**
 * Use Case: View Bank Account Transactions.
 *
 * Fetches and maps transaction history for a specific bank account.
 */
export function useBankTransactions(accountId: BankAccountId) {
  const {
    data: transactions,
    isPending,
    error,
    refetch,
  } = useQuery<BankTransaction[]>({
    queryKey: bankKeys.transactions(accountId),
    queryFn: async () => {
      const dtos = await bankAdapter.getTransactions(accountId)
      return dtos.map((dto) => BankMapper.toTransaction(dto, accountId))
    },
    enabled: computed(() => !!accountId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  return {
    transactions,
    isPending,
    error,
    refetch,
  }
}
