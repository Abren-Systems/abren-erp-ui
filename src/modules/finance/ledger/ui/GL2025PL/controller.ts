import { useDataGrid } from '@/shared/components/data-grid'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useLedgerAccounts } from '../../application/useLedgerAccounts'
import { GL2025PL } from './screen'

export function useAccountListController() {
  const gridState = useDataGrid()
  const router = useRouter()
  const { accounts, isPending, error, refetch } = useLedgerAccounts()

  const base = useScreenController({
    screen: GL2025PL,
    dataSource: { entity: computed(() => null), isLoading: isPending, error },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
    grids: computed(() => ({
      primary: {
        data: accounts.value || [],
        columns: [], // We'll add this later if needed
        selection: gridState.rowSelection.value,
        filters: {},
      },
    })),
  })

  function handleRowClick(row: { id: string }) {
    void router.push({ name: 'LedgerCoaDetail', params: { id: row.id } })
  }

  base.registerCommand('create', {
    execute: async () => {
      void router.push({ name: 'LedgerCoaDetail', params: { id: 'new' } })
    },
    isPending: ref(false),
  })

  return {
    ...base,
    accounts,
    refresh: refetch,
    handleRowClick,
    gridState,
  }
}
