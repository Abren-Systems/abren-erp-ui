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

import type { VendorBill } from '../../models/ap.types'

export function useVendorBillsListController() {
  const router = useRouter()
  const { bills, isLoading, error, refetch } = useVendorBills()
  const gridState = useDataGrid()

  const base = useScreenController<VendorBill[], 'VIEW'>({
    screen: AP3010PL,
    dataSource: {
      entity: computed(() => bills.value?.items.map((i) => i.data) ?? []),
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

  return {
    ...base,
    bills,
    gridState,
    handleRowClick,
  }
}
