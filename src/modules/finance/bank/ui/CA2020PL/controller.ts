import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
// Mocking bank account hooks as we don't have them in application layer
import type { BankAccount } from '../../domain/bank.types'
import { CA2020PL } from './screen'

export function useBankAccountsListController() {
  const router = useRouter()
  const accounts = ref<BankAccount[]>([])
  const isLoading = ref(false)
  const error = ref(null)

  const base = useScreenController({
    screen: CA2020PL,
    dataSource: { entity: computed(() => null), isLoading, error },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  function handleCreate() {
    void router.push({ name: 'finance.bank.account', params: { id: 'new' } })
  }

  function handleRowClick(row: { id: string }) {
    void router.push({ name: 'finance.bank.account', params: { id: row.id } })
  }

  return {
    ...base,
    accounts,
    refresh: () => {},
    handleCreate,
    handleRowClick,
  }
}
