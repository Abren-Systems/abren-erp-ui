import { useDataGrid } from '@/shared/components/data-grid'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useStockPositions } from '../../application/useStockPositions'
import { useWarehouses } from '../../application/useWarehouses'
import { IN2025PL } from './screen'

export function useStockItemsListController() {
  const gridState = useDataGrid()
  const router = useRouter()
  const selectedWarehouseId = ref<string | undefined>(undefined)

  const { warehouses } = useWarehouses()
  const {
    stockItems,
    isPending: isLoading,
    error,
    refetch: refresh,
  } = useStockPositions(selectedWarehouseId)

  const base = useScreenController({
    screen: IN2025PL,
    dataSource: { entity: computed(() => null), isLoading, error },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  function handleCreateAdjustment() {
    void router.push({ name: 'inventory.adjustment-create' })
  }

  function handleRowClick(row: { id: string }) {
    void router.push({ name: 'inventory.stock-detail', params: { id: row.id } })
  }

  return {
    ...base,
    warehouses,
    stockItems,
    selectedWarehouseId,
    refresh,
    handleCreateAdjustment,
    handleRowClick,
    gridState,
}
}
