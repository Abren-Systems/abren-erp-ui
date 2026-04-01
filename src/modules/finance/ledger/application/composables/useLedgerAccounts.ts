import { useQuery } from '@tanstack/vue-query'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
import { LedgerMapper } from '../../infrastructure/mappers'
import type { Account } from '../../domain/account.types'

/**
 * Use Case: View Chart of Accounts.
 *
 * Fetches and maps all General Ledger accounts.
 *
 * @example
 * const { accounts, isLoading } = useLedgerAccounts()
 */
export function useLedgerAccounts() {
  const {
    data: accounts,
    isPending,
    error,
    refetch,
  } = useQuery<Account[]>({
    queryKey: ['ledger-accounts'],
    queryFn: async () => {
      const dtos = await ledgerAdapter.getAccounts()
      return dtos.map((dto) => LedgerMapper.toAccount(dto))
    },
    staleTime: 1000 * 60 * 5,
  })

  return {
    accounts,
    isPending,
    error,
    refetch,
  }
}
