import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useActiveTaxGroups } from '../../application/useTaxRules'
import { TX2010PL } from './screen'

export function useTaxGroupsListController() {
  const { data: groups, isPending: isLoading, error, refetch: refresh } = useActiveTaxGroups()

  const router = useRouter()

  const base = useScreenController({
    screen: TX2010PL,
    dataSource: { entity: computed(() => null), isLoading, error },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  function handleCreate() {
    void router.push({ name: 'finance.tax.group', params: { id: 'new' } })
  }

  function handleRowClick(row: { id: string }) {
    void router.push({ name: 'finance.tax.group', params: { id: row.id } })
  }

  return {
    ...base,
    groups,
    refresh,
    handleCreate,
    handleRowClick,
  }
}
