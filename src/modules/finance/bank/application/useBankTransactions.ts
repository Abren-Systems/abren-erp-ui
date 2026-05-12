import { useApiQuery } from '@/shared/composables/useApiQuery'
import { bankAdapter } from '../infrastructure/bank.adapter'
import type { BankAccountId } from '@/shared/types/brand.types'
import { computed } from 'vue'
import { bankKeys } from './query-keys'

import type { ListQuery } from '@/shared/domain/pagination'
import { BankMapper } from '../infrastructure/mappers'
import type { BankTransactionDTO } from '../infrastructure/api.types'

/**
 * Use Case: View Bank Account Transactions (Paginated).
 *
 * @param accountId - The unique identifier of the bank account.
 * @param {ListQuery} [query] - Optional pagination parameters.
 */
export function useBankTransactions(accountId: BankAccountId, query?: ListQuery) {
  const {
    data: response,
    isPending,
    error,
    refetch,
  } = useApiQuery(
    bankKeys.transactions(accountId, query),
    async () => {
      const data = await bankAdapter.getTransactions(accountId, query)
      return {
        ...data,
        items: data.items.map((dto: BankTransactionDTO) =>
          BankMapper.toTransaction(dto, accountId),
        ),
      }
    },
    {
      enabled: computed(() => !!accountId),
      staleTime: 1000 * 60 * 2,
    },
  )

  return {
    transactions: response,
    isPending,
    error,
    refetch,
  }
}
