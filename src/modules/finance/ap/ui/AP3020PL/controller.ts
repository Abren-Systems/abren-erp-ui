import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useVendorBills } from '../../application/useVendorBills'
import { AP3020PL } from './screen'

export function useVendorBillsListController() {
  const router = useRouter()
  const { bills, isLoading, error, refetch: refresh } = useVendorBills()

  const base = useScreenController({
    screen: AP3020PL,
    dataSource: { entity: computed(() => null), isLoading, error },
    isNew: computed(() => false),
  })

  function handleRowClick(row: { id: string }) {
    void router.push({ name: 'VendorBillDetail', params: { id: row.id } })
  }

  function handleCreate() {
    void router.push({ name: 'VendorBillDetail', params: { id: 'new' } })
  }

  return {
    ...base,
    bills,
    refresh,
    handleRowClick,
    handleCreate,
  }
}
