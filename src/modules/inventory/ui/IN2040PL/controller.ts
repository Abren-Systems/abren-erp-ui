import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useWarehouses } from '../../application/useWarehouses'
import { IN2040PL } from './screen'

export function useWarehousesListController() {
  const router = useRouter()
  const { warehouses, isPending: isLoading, error, refetch: refresh } = useWarehouses()

  const base = useScreenController({
    screen: IN2040PL,
    dataSource: { entity: computed(() => null), isLoading, error },
    isNew: computed(() => false),
  })

  function handleCreate() {
    void router.push({ name: 'inventory.warehouse-create' })
  }

  function handleRowClick(row: { id: string }) {
    void router.push({ name: 'inventory.warehouse-detail', params: { id: row.id } })
  }

  return {
    ...base,
    warehouses,
    refresh,
    handleCreate,
    handleRowClick,
  }
}
