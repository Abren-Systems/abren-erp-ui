import { useDataGrid } from '@/shared/components/data-grid'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useActiveTaxGroups } from '../../application/useTaxRules'
import { TX2010PL } from './screen'

export function useTaxGroupsListController() {
  const gridState = useDataGrid()
  const router = useRouter()
  const { data: groups, isLoading, error, refetch } = useActiveTaxGroups()

  const base = useScreenController({
    screen: TX2010PL,
    dataSource: {
      entity: groups,
      isLoading,
      error,
    },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Register Creation Command
  base.registerCommand('create', {
    execute: async () => {
      void router.push({ name: 'finance.tax.groups.detail', params: { id: 'new' } })
    },
    isPending: computed(() => false),
  })

  const handleRowClick = (row: unknown) => {
    void router.push({
      name: 'finance.tax.groups.detail',
      params: { id: (row as { id: string }).id },
    })
  }

  const handleCreate = () => {
    void base.commands.value['create']?.execute()
  }

  return {
    ...base,
    groups,
    handleRowClick,
    handleCreate,
    refresh: refetch,
    gridState,
}
}
