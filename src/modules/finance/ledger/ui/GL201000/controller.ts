import { computed, ref, watch } from 'vue'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useDataGrid } from '@/shared/components/data-grid'
import { useFiscalCalendar } from '../../application/useFiscalCalendar'
import { GL201000 } from './screen'

export function useFiscalPeriodsController() {
  const { years, isLoading, error, refresh } = useFiscalCalendar()
  const gridState = useDataGrid()

  // Master selection
  const selectedYearId = ref<string | null>(null)
  const selectedYear = computed(
    () => years.value?.find((y) => y.id === selectedYearId.value) || null,
  )

  // Auto-select first year if none selected
  watch(
    years,
    (newYears) => {
      if (newYears?.length && !selectedYearId.value && newYears[0]) {
        selectedYearId.value = newYears[0].id
      }
    },
    { immediate: true },
  )

  const base = useScreenController<unknown, 'VIEW'>({
    screen: GL201000,
    dataSource: {
      entity: years,
      isLoading,
      error,
    },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  base.registerCommand('refresh', {
    execute: async () => {
      await refresh()
    },
    isPending: isLoading,
  })

  // --- Fiscal Lifecycle Commands ---

  const { closeYear, lockYear, closePeriod, lockPeriod } = useFiscalCalendar()

  const canCloseYear = computed(() => selectedYear.value?.status === 'OPEN')
  const canLockYear = computed(() => selectedYear.value?.status === 'CLOSED')

  base.registerCommand('closeYear', {
    execute: async () => {
      if (!selectedYearId.value || !canCloseYear.value) return
      await closeYear(selectedYearId.value)
    },
    isPending: isLoading,
  })

  base.registerCommand('lockYear', {
    execute: async () => {
      if (!selectedYearId.value || !canLockYear.value) return
      await lockYear(selectedYearId.value)
    },
    isPending: isLoading,
  })

  // Row-level commands for the grid
  const handleClosePeriod = async (periodId: string) => {
    await closePeriod(periodId)
  }

  const handleLockPeriod = async (periodId: string) => {
    await lockPeriod(periodId)
  }

  return {
    ...base,
    years,
    selectedYear,
    selectedYearId,
    isLoading,
    gridState,
    canCloseYear,
    canLockYear,
    closePeriod: handleClosePeriod,
    lockPeriod: handleLockPeriod,
  }
}
