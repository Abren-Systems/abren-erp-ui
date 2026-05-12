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

  const query = computed(() => ({
    offset: gridState.pagination.value.pageIndex * gridState.pagination.value.pageSize,
    limit: gridState.pagination.value.pageSize,
  }))

  const { bankAccounts, isPending: isLoading, error, refetch: refresh } = useBankAccounts(query)

  const base = useScreenController({
    screen: CA2020PL,
    dataSource: {
      entity: computed(() => response.value?.items ?? []),
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

  const totalCount = computed(() => bankAccounts.value?.totalCount ?? 0)

  return {
    ...base,
    bankAccounts,
    totalCount,
    refresh,
    gridState,
    handleCreate,
    handleRowClick,
  }
}
