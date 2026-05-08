import { useDataGrid } from '@/shared/components/data-grid'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useAdjustments } from '../../application/useInventoryAdjustment'
import { IN3030PL } from './screen'

export function useAdjustmentsListController() {
  const gridState = useDataGrid()
  const router = useRouter()
  const { adjustments, isLoading, error, refetch: refresh } = useAdjustments()

  const base = useScreenController({
    screen: IN3030PL,
    dataSource: { entity: adjustments, isLoading, error },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Register Creation Command
  base.registerCommand('create', {
    execute: async () => {
      void router.push({ name: 'inventory.adjustment-detail', params: { id: 'new' } })
    },
    isPending: computed(() => false),
  })

  const handleCreate = () => {
    void base.commands.value['create']?.execute()
  }

  const handleRowClick = (row: unknown) => {
    void router.push({
      name: 'inventory.adjustment-detail',
      params: { id: (row as { id: string }).id },
    })
  }

  return {
    ...base,
    adjustments,
    refresh,
    handleCreate,
    handleRowClick,
    gridState,
  }
}
