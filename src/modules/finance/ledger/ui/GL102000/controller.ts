import { computed, ref, watch } from 'vue'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useDataGrid } from '@/shared/components/data-grid'
import { useFiscalCalendar } from '../../application/useFiscalCalendar'
import { GL102000 } from './screen'

import type { FiscalYear } from '../../domain/fiscal-calendar.types'
import { GL102000_Generate_Fields } from './fields'

export function useFiscalPeriodsController() {
  const { years, isLoading, error, generateYear } = useFiscalCalendar()
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

  const base = useScreenController<FiscalYear[], 'VIEW'>({
    screen: GL102000,
    dataSource: {
      entity: years,
      isLoading,
      error,
    },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  const isGenerateOpen = ref(false)

  // Fields for generation
  const genYear = ref('')
  const genStartDate = ref<string>('')
  const genEndDate = ref<string>('')

  base.registerCommand('create', {
    execute: async () => {
      const nextYear = new Date().getFullYear()
      genYear.value = String(nextYear)
      genStartDate.value = `${nextYear}-01-01`
      genEndDate.value = `${nextYear}-12-31`
      isGenerateOpen.value = true
    },
    isPending: computed(() => false),
  })

  const isGenerateValid = computed(() => {
    return genYear.value.trim().length === 4 && !!genStartDate.value && !!genEndDate.value
  })

  base.registerCommand('executeGenerate', {
    execute: async () => {
      if (!isGenerateValid.value) return
      try {
        await generateYear({
          year: genYear.value,
          start_date: genStartDate.value,
          end_date: genEndDate.value,
        })
        isGenerateOpen.value = false
      } catch {
        // Error Contract handles field errors
      }
    },
    isPending: isLoading,
  })

  base.registerCommand('refresh', {
    execute: async () => {
      // DataSource refresh logic
    },
    isPending: isLoading,
  })

  return {
    ...base,
    years,
    selectedYear,
    selectedYearId,
    isLoading,
    gridState,
    isGenerateOpen,
    fields: {
      genYear,
      genStartDate,
      genEndDate,
      registry: GL102000_Generate_Fields,
    },
    isGenerateValid,
  }
}
