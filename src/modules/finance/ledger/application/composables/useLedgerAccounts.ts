import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
import { LedgerMapper } from '../../infrastructure/mappers'
import { ledgerKeys } from '../keys'
import type { AccountCreateDTO } from '../../infrastructure/api.types'

/**
 * Use Case: View and Manage Chart of Accounts.
 */
export function useLedgerAccounts() {
  const queryClient = useQueryClient()

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

  const { mutateAsync: createAccount, isPending: isCreating } = useMutation({
    mutationFn: (data: AccountCreateDTO) => ledgerAdapter.createAccount(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ledgerKeys.accounts() })
    },
  })

  return {
    accounts,
    isPending,
    error,
    refetch,
    createAccount,
    isCreating,
  }
}
