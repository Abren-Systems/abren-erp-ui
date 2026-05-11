import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { bankAdapter } from '../infrastructure/bank.adapter'
import { bankKeys } from './query-keys'

import type { ListQuery } from '@/shared/domain/pagination'
import { BankMapper } from '../infrastructure/mappers'

/**
 * Use Case: View Bank Accounts (Paginated).
 *
 * @param {ListQuery} [query] - Optional pagination parameters.
 */
export function useBankAccounts(query?: ListQuery) {
  const {
    data: response,
    isPending,
    error,
    refetch,
  } = useResourceQuery(
    bankKeys.accounts(query),
    () => bankAdapter.getBankAccounts(query),
    (data) => ({
      ...data,
      items: data.items.map((dto) => BankMapper.toBankAccount(dto)),
    }),
    { staleTime: 1000 * 60 * 5 },
  )

  return {
    accounts: response,
    isPending,
    error,
    refetch,
  }
}
