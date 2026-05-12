import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useDataGrid } from '@/shared/components/data-grid'
import { useVendorBills } from '../../application/useVendorBills'
import { AP3010PL } from './screen'
import type { ListQuery } from '@/shared/domain/pagination'

import type { VendorBill } from '../../models/ap.types'

export function useVendorBillsListController() {
  const router = useRouter()
  const gridState = useDataGrid()

  const query = computed<ListQuery>(() => ({
    offset: gridState.pagination.value.pageIndex * gridState.pagination.value.pageSize,
    limit: gridState.pagination.value.pageSize,
  }))

  const { vendorBills, isLoading, error, refetch } = useVendorBills(query)

  const base = useScreenController<VendorBill[], 'VIEW'>({
    screen: AP3010PL,
    dataSource: {
      entity: computed(() => vendorBills.value?.items ?? []),
      isLoading,
      error,
    },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Register Commands
  base.registerCommand('create', {
    execute: async () => {
      void router.push({ name: 'VendorBillDetail', params: { id: 'new' } })
    },
    isPending: computed(() => false),
  })

  base.registerCommand('refresh', {
    execute: async () => {
      await refetch()
    },
    isPending: isLoading,
  })

  const handleRowClick = (row: unknown) => {
    void router.push({
      name: 'VendorBillDetail',
      params: { id: (row as VendorBill).id },
    })
  }

  const totalCount = computed(() => vendorBills.value?.totalCount ?? 0)

  return {
    ...base,
    vendorBills,
    totalCount,
    gridState,
    handleRowClick,
  }
}
