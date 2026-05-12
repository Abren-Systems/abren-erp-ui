import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useDataGrid } from '@/shared/components/data-grid'
import { useScreenController, LIST_SCREEN_POLICY } from '@/platform/screen-runtime'
import { useFiscalCalendar } from '../../application/useFiscalCalendar'
import { GL503000 } from './screen'
import { GL503000_FIELDS } from './fields'
import type { ApiError } from '@/shared/api/http-client'
import type { FiscalYearId, FiscalPeriodId } from '@/shared/types/brand.types'

export type PeriodProcessAction = 'CLOSE' | 'OPEN' | 'LOCK' | 'UNLOCK'

export function useManagePeriodsController() {
  const { fiscalYears, isLoading, error, closePeriod, openPeriod, lockPeriod, unlockPeriod } =
    useFiscalCalendar()
  const gridState = useDataGrid()

  // ── Platform Base ──
  const base = useScreenController({
    screen: GL503000,
    dataSource: {
      entity: computed(() => null),
      isLoading,
      error,
    },
    statePolicy: LIST_SCREEN_POLICY,
    getDomainState: () => 'VIEW' as const,
  })

  // Header State
  const selectedYearId = ref<FiscalYearId | null>(null)
  const selectedAction = ref<PeriodProcessAction>('CLOSE')
  const isProcessing = ref(false)

  // Options
  const yearOptions = computed(() =>
    (fiscalYears.value || []).map((y) => ({
      label: y.year,
      value: y.id,
    })),
  )

  const actionOptions: { label: string; value: PeriodProcessAction }[] = [
    { label: 'Close Period', value: 'CLOSE' },
    { label: 'Open Period', value: 'OPEN' },
    { label: 'Lock Period', value: 'LOCK' },
    { label: 'Unlock Period', value: 'UNLOCK' },
  ]

  // Data
  const periods = computed(() => {
    if (!selectedYearId.value || !fiscalYears.value) return []
    const year = fiscalYears.value.find((y) => y.id === selectedYearId.value)
    return year?.periods || []
  })

  // Set default year
  watch(
    fiscalYears,
    (val) => {
      if (val && val.length > 0 && !selectedYearId.value) {
        selectedYearId.value = val[0]?.id || null
      }
    },
    { immediate: true },
  )

  // Actions
  async function handleProcess() {
    const selectedIds = Object.keys(gridState.rowSelection.value)
    if (selectedIds.length === 0) return

    isProcessing.value = true
    let successCount = 0

    try {
      for (const id of selectedIds) {
        const brandedId = id as FiscalPeriodId
        try {
          switch (selectedAction.value) {
            case 'CLOSE':
              await closePeriod(brandedId)
              break
            case 'OPEN':
              await openPeriod(brandedId)
              break
            case 'LOCK':
              await lockPeriod(brandedId)
              break
            case 'UNLOCK':
              await unlockPeriod(brandedId)
              break
          }
          successCount++
        } catch (err) {
          const apiErr = err as ApiError
          toast.error(`Failed to ${selectedAction.value.toLowerCase()} period: ${apiErr.message}`)
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} periods`)
      }
      gridState.rowSelection.value = {}
    } finally {
      isProcessing.value = false
    }
  }

  return {
    ...base,
    // Screen Policy
    screen: GL503000,
    policy: LIST_SCREEN_POLICY,
    fields: GL503000_FIELDS,

    // State
    isLoading,
    isProcessing,
    error,
    selectedYearId,
    selectedAction,

    // Data
    periods,
    yearOptions,
    actionOptions,

    // Grid
    gridState,

    // Actions
    handleProcess,
  }
}

export type ManagePeriodsController = ReturnType<typeof useManagePeriodsController>
