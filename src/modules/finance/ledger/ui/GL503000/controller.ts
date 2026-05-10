import { computed, ref, watch } from 'vue'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useDataGrid } from '@/shared/composables/useDataGrid'
import { useFiscalCalendar } from '../../application/useFiscalCalendar'
import { GL503000 } from './screen'
import type { FiscalPeriod } from '../../domain/fiscal-calendar.types'
import { GL503000_FIELDS } from './fields'

export type PeriodProcessAction = 'CLOSE' | 'OPEN' | 'LOCK' | 'UNLOCK'

export function useManagePeriodsController() {
  const { years, isLoading, error, closePeriod, lockPeriod } = useFiscalCalendar()
  const gridState = useDataGrid()

  // Header State
  const selectedAction = ref<PeriodProcessAction>('CLOSE')
  const selectedYearId = ref<string | null>(null)

  // Auto-select current/latest year
  watch(
    years,
    (newYears) => {
      if (newYears?.length && !selectedYearId.value && newYears[0]) {
        selectedYearId.value = newYears[0].id
      }
    },
    { immediate: true },
  )

  const selectedYear = computed(
    () => years.value?.find((y) => y.id === selectedYearId.value) || null,
  )

  // Filtered Periods based on Action
  const filteredPeriods = computed<FiscalPeriod[]>(() => {
    if (!selectedYear.value) return []

    const allPeriods = selectedYear.value.periods

    return allPeriods.filter((p) => {
      switch (selectedAction.value) {
        case 'CLOSE':
          return p.status === 'OPEN'
        case 'OPEN':
          return p.status === 'CLOSED'
        case 'LOCK':
          return p.status === 'CLOSED'
        case 'UNLOCK':
          return p.status === 'LOCKED'
        default:
          return false
      }
    })
  })

  const base = useScreenController<FiscalPeriod[], 'VIEW'>({
    screen: GL503000,
    dataSource: {
      entity: filteredPeriods,
      isLoading,
      error,
    },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Processing Logic
  const isProcessing = ref(false)

  const processSelected = async () => {
    const selectedIds = Object.keys(gridState.rowSelection.value)
    if (selectedIds.length === 0) return

    isProcessing.value = true
    try {
      for (const id of selectedIds) {
        if (selectedAction.value === 'CLOSE') {
          await closePeriod(id)
        } else if (selectedAction.value === 'LOCK') {
          await lockPeriod(id)
        }
        // TODO: Implement OPEN/UNLOCK when backend is ready
      }
      gridState.rowSelection.value = {}
    } finally {
      isProcessing.value = false
    }
  }

  base.registerCommand('process', {
    execute: processSelected,
    isPending: computed(() => isProcessing.value || isLoading.value),
  })

  base.registerCommand('processAll', {
    execute: async () => {
      const allIds = filteredPeriods.value.map((p) => p.id)
      gridState.rowSelection.value = allIds.reduce((acc, id) => ({ ...acc, [id]: true }), {})
      await processSelected()
    },
    isPending: computed(() => isProcessing.value || isLoading.value),
  })

  return {
    ...base,
    years,
    selectedAction,
    selectedYearId,
    gridState,
    fields: {
      registry: GL503000_FIELDS,
    },
    isProcessing,
    isLoading,
  }
}
