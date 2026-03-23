import { useQuery } from '@tanstack/vue-query'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'

/**
 * Composable for managing ledger accounts state and fetching
 */
export function useLedgerAccounts() {
  const {
    data: accounts,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ledger-accounts'],
    queryFn: () => ledgerAdapter.getAccounts(),
    staleTime: 1000 * 60 * 5,
  })

  return {
    accounts,
    isPending,
    error,
    refetch,
  }
}
