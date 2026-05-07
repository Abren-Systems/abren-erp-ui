import { useDataGrid } from '@/shared/components/data-grid'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useWarehouses } from '../../application/useWarehouses'
import { IN2040PL } from './screen'

export function useWarehousesListController() {
  const gridState = useDataGrid()
  const router = useRouter()
  const { warehouses, isPending: isLoading, error, refetch: refresh } = useWarehouses()

  const base = useScreenController({
    screen: IN2040PL,
    dataSource: { entity: warehouses, isLoading, error },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Register Creation Command
  base.registerCommand('create', {
    execute: async () => {
      void router.push({ name: 'inventory.warehouse-detail', params: { id: 'new' } })
    },
    isPending: computed(() => false),
  })

  const handleCreate = () => {
    void base.commands.value['create']?.execute()
  }

  const handleRowClick = (row: unknown) => {
    void router.push({
      name: 'inventory.warehouse-detail',
      params: { id: (row as { id: string }).id },
    })
  }

  return {
    ...base,
    warehouses,
    refresh,
    handleCreate,
    handleRowClick,
    gridState,
}
}
