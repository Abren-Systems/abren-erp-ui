import { useApiQuery } from '@/shared/composables/useApiQuery'
import { bankAdapter } from '../infrastructure/bank.adapter'
import type { BankAccountId } from '@/shared/types/brand.types'
import { toValue, type MaybeRefOrGetter, computed } from 'vue'
import { bankKeys } from './query-keys'

import type { ListQuery } from '@/shared/domain/pagination'

/**
 * Use Case: View Bank Account Transactions (Paginated).
 *
 * @param accountId - The unique identifier of the bank account.
 * @param {MaybeRefOrGetter<ListQuery>} [query] - Optional pagination parameters.
 */
export function useBankTransactions(accountId: BankAccountId, query?: MaybeRefOrGetter<ListQuery>) {
  const {
    data: response,
    isPending,
    error,
    refetch,
  } = useApiQuery(
    bankKeys.transactions(accountId, query),
    () => bankAdapter.getTransactions(accountId, toValue(query)),
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
