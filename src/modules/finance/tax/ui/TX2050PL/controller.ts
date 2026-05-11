import { useDataGrid } from '@/shared/components/data-grid'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useActiveTaxRules } from '../../application/useTaxRules'
import { TX2050PL } from './screen'

export function useTaxRulesListController() {
  const gridState = useDataGrid()
  const router = useRouter()
  const { data: rules, isLoading, error, refetch } = useActiveTaxRules()

  const base = useScreenController({
    screen: TX2050PL,
    dataSource: {
      entity: rules,
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
      void router.push({ name: 'TaxesDetail', params: { id: 'new' } })
    },
    isPending: computed(() => false),
  })

  const handleRowClick = (row: unknown) => {
    void router.push({
      name: 'TaxesDetail',
      params: { id: (row as { id: string }).id },
    })
  }

  const handleCreate = () => {
    void base.commands.value['create']?.execute()
  }

  return {
    ...base,
    rules,
    handleRowClick,
    handleCreate,
    refresh: refetch,
    gridState,
  }
}
