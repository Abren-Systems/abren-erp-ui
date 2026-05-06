import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { IN3030PL } from './screen'

export function useAdjustmentsListController() {
  const router = useRouter()
  // Mock data as there's no useAdjustments query currently
  const adjustments = ref<unknown[]>([])
  const isLoading = ref(false)
  const error = ref(null)

  const base = useScreenController({
    screen: IN3030PL,
    dataSource: { entity: computed(() => null), isLoading, error },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  function handleCreate() {
    void router.push({ name: 'inventory.adjustment-create' })
  }

  function handleRowClick(row: { id: string }) {
    void router.push({ name: 'inventory.adjustment-detail', params: { id: row.id } })
  }

  return {
    ...base,
    adjustments,
    refresh: () => {},
    handleCreate,
    handleRowClick,
  }
}
