import { useQuery } from '@tanstack/vue-query'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
import { mapAccount } from '../../infrastructure/mappers'
import type { Account } from '../../domain/account.types'

/**
 * Composable for managing ledger accounts state and fetching
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
      return dtos.map(mapAccount)
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
