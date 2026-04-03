import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
import { LedgerMapper } from '../../infrastructure/mappers'
import { ledgerKeys } from '../keys'

/**
 * Use Case: View Chart of Accounts.
 *
 * Fetches and maps all General Ledger accounts.
 *
 * @returns Reactive accounts state and refetch function.
 * @example
 * const { accounts, isLoading } = useLedgerAccounts()
 */
export function useLedgerAccounts() {
  const {
    data: accounts,
    isPending,
    error,
    refetch,
  } = useResourceQuery(
    ledgerKeys.accounts(),
    () => ledgerAdapter.getAccounts(),
    (dtos) => dtos.map((dto) => LedgerMapper.toAccount(dto)),
    { staleTime: 1000 * 60 * 5 },
  )

  return {
    accounts,
    isPending,
    error,
    refetch,
  }
}
