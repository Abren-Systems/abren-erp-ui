import { computed, ref } from 'vue'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useDataGrid } from '@/shared/components/data-grid'
import { useFiscalPeriods } from '../../application/useFiscalPeriods'
import { GL102000 } from './screen'

import type { FiscalPeriod } from '../../domain/fiscal-period.types'
import { GL102000_Create_Fields } from './fields'

export function useFiscalPeriodsController() {
  const { periods, isLoading, error, createPeriod } = useFiscalPeriods()
  const gridState = useDataGrid()

  const base = useScreenController<FiscalPeriod[], 'VIEW'>({
    screen: GL102000,
    dataSource: {
      entity: periods,
      isLoading,
      error,
    },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  const isCreateOpen = ref(false)

  // Fields
  const createName = ref('')
  const createStartDate = ref<string>('')
  const createEndDate = ref<string>('')

  base.registerCommand('create', {
    execute: async () => {
      createName.value = ''
      createStartDate.value = ''
      createEndDate.value = ''
      isCreateOpen.value = true
    },
    isPending: computed(() => false),
  })

  const isCreateValid = computed(() => {
    return createName.value.trim().length > 0 && !!createStartDate.value && !!createEndDate.value
  })

  base.registerCommand('executeCreate', {
    execute: async () => {
      if (!isCreateValid.value) return
      try {
        await createPeriod({
          name: createName.value,
          start_date: createStartDate.value,
          end_date: createEndDate.value,
        })
        isCreateOpen.value = false
      } catch {
        // Error Contract handles field errors
      }
    },
    isPending: isLoading, // Or a separate isCreating flag if useFiscalPeriods had one
  })

  base.registerCommand('refresh', {
    execute: async () => {
      // In a real implementation this would refetch
      console.log('Refresh fiscal periods')
    },
    isPending: isLoading,
  })

  return {
    ...base,
    periods,
    isLoading,
    gridState,
    isCreateOpen,
    fields: {
      createName,
      createStartDate,
      createEndDate,
      registry: GL102000_Create_Fields,
    },
    isCreateValid,
  }
}
