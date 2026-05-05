import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useActiveTaxRules } from '../../application/useTaxRules'
import { TX2020PL } from './screen'

export function useTaxRulesListController() {
  const { data: rules, isPending: isLoading, error, refetch: refresh } = useActiveTaxRules()

  const router = useRouter()

  const base = useScreenController({
    screen: TX2020PL,
    dataSource: { entity: computed(() => null), isLoading, error },
    isNew: computed(() => false),
  })

  function handleCreate() {
    void router.push({ name: 'finance.tax.rule', params: { id: 'new' } })
  }

  function handleRowClick(row: { id: string }) {
    void router.push({ name: 'finance.tax.rule', params: { id: row.id } })
  }

  return {
    ...base,
    rules,
    refresh,
    handleCreate,
    handleRowClick,
  }
}
