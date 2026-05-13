import { toValue, type MaybeRefOrGetter } from 'vue'
import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { bankAdapter } from '../infrastructure/bank.adapter'
import { bankKeys } from './query-keys'

import type { ListQuery } from '@/shared/domain/pagination'

/**
 * Use Case: View Bank Accounts (Paginated).
 *
 * @param {MaybeRefOrGetter<ListQuery>} [query] - Optional pagination parameters.
 */
export function useBankAccounts(query?: MaybeRefOrGetter<ListQuery>) {
  const {
    data: response,
    isPending,
    error,
    refetch,
  } = useResourceQuery(
    bankKeys.accounts(query),
    () => bankAdapter.getBankAccounts(toValue(query)),
    undefined,
    { staleTime: 1000 * 60 * 5 },
  )

  return {
    bankAccounts: response,
    isPending,
    error,
    refetch,
  }
}
