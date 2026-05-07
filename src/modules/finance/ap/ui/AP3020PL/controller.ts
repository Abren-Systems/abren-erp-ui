import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useVendorBills } from '../../application/useVendorBills'
import { AP3020PL } from './screen'

import type { VendorBill } from '../../domain/ap.types'

export function useVendorBillsListController() {
  const router = useRouter()
  const { bills, isLoading, error, refetch } = useVendorBills()

  const base = useScreenController<VendorBill[], 'VIEW'>({
    screen: AP3020PL,
    dataSource: {
      entity: bills,
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
    handleRowClick,
  }
}
