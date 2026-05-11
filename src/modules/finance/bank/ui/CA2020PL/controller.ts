import { useDataGrid } from '@/shared/components/data-grid'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useBankAccounts } from '../../application/useBankAccounts'
import { CA2020PL } from './screen'

export function useBankAccountsListController() {
  const gridState = useDataGrid()
  const router = useRouter()

  const { accounts, isPending: isLoading, error, refetch: refresh } = useBankAccounts()

  const base = useScreenController({
    screen: CA2020PL,
    dataSource: {
      entity: computed(() => accounts.value?.items ?? []),
      isLoading,
      error,
    },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  function handleCreate() {
    void router.push({ name: 'finance.bank.account', params: { id: 'new' } })
  }

  function handleRowClick(row: { id: string }) {
    void router.push({ name: 'finance.bank.account', params: { id: row.id } })
  }

  return {
    ...base,
    accounts,
    refresh,
    gridState,
    handleCreate,
    handleRowClick,
  }
}
