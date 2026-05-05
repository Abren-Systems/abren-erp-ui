import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useLedgerAccounts } from '../../application/useLedgerAccounts'
import { GL2010PL } from './screen'

export function useAccountListController() {
  const router = useRouter()
  const { accounts, isPending, error, refetch } = useLedgerAccounts()

  const base = useScreenController({
    screen: GL2010PL,
    dataSource: { entity: computed(() => null), isLoading: isPending, error },
    isNew: computed(() => false),
  })

  function handleRowClick(row: { id: string }) {
    void router.push({ name: 'LedgerCoaDetail', params: { id: row.id } })
  }

  return {
    ...base,
    accounts,
    refresh: refetch,
    handleRowClick,
  }
}
