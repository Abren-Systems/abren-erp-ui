import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useVendorBills } from '../../application/useVendorBills'
import { AP3020PL } from './screen'
import { AP3020PL_POLICY } from './policy'
import type { VendorBill } from '../../domain/ap.types'

export function useVendorBillsListController() {
  const router = useRouter()
  const { bills, isLoading, refetch } = useVendorBills()

  const base = useScreenController<VendorBill[], 'LIST'>({
    screen: AP3020PL,
    dataSource: {
      entity: bills,
      isLoading,
      error: ref(null),
    },
    isNew: computed(() => false),
    getDomainState: () => 'LIST',
    statePolicy: AP3020PL_POLICY,
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
