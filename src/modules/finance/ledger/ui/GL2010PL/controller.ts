import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useLedgerAccounts } from '../../application/useLedgerAccounts'
import { GL2010PL } from './screen'

export function useAccountListController() {
  const router = useRouter()
  const { accounts, isPending, error, refetch } = useLedgerAccounts()

  const base = useScreenController({
    screen: GL2010PL,
    dataSource: { entity: computed(() => null), isLoading: isPending, error },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  function handleRowClick(row: { id: string }) {
    void router.push({ name: 'LedgerCoaDetail', params: { id: row.id } })
  }

  base.registerCommand('create', {
    execute: async () => {
      void router.push({ name: 'LedgerCoaDetail', params: { id: 'new' } })
    },
    isPending: ref(false),
  })

  return {
    ...base,
    accounts,
    refresh: refetch,
    handleRowClick,
  }
}
