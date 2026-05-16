import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVendors } from '../../application/useVendors'
import { AP3030PL } from './screen'
import type { VendorDTO } from '../../infrastructure/api.types'

export function useVendorsListController() {
  const router = useRouter()
  const { vendors, isLoading, error } = useVendors()

  const base = useScreenController<VendorDTO[], string>({
    screen: AP3030PL,
    dataSource: {
      entity: computed(() => vendors.value || []),
      isLoading,
      error,
    },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Register commands
  base.registerCommand('new_vendor', {
    execute: async () => void router.push({ name: 'VendorDetail', params: { id: 'new' } }),
    isPending: computed(() => false),
  })

  // List controller specific properties
  const vendorsList = computed(() => vendors.value || [])

  const navigateToDetail = (id: string) => {
    void router.push({ name: 'VendorDetail', params: { id } })
  }

  return {
    ...base,
    vendors: vendorsList,
    navigateToDetail,
  }
}
