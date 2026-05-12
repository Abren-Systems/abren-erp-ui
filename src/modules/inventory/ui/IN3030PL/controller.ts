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
import type { ListQuery } from '@/shared/domain/pagination'

export function useAdjustmentsListController() {
  const gridState = useDataGrid()
  const router = useRouter()
  const query = computed<ListQuery>(() => ({
    offset: gridState.pagination.value.pageIndex * gridState.pagination.value.pageSize,
    limit: gridState.pagination.value.pageSize,
  }))

  const { inventoryAdjustments, isLoading, error, refetch: refresh } = useAdjustments(query)

  // Unwrap operational envelopes for grid consumption
  const adjustmentItems = computed(() => inventoryAdjustments.value?.items ?? [])

  const base = useScreenController({
    screen: IN3030PL,
    dataSource: {
      entity: adjustmentItems,
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

  const totalCount = computed(() => inventoryAdjustments.value?.totalCount ?? 0)

  return {
    ...base,
    adjustmentItems,
    totalCount,
    refresh,
    handleCreate,
    handleRowClick,
    gridState,
  }
}
