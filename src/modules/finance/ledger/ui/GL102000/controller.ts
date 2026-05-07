import { computed } from 'vue'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useDataGrid } from '@/shared/components/data-grid'
import { useFiscalPeriods } from '../../application/useFiscalPeriods'
import { GL102000 } from './screen'

import type { FiscalPeriod } from '../../domain/fiscal-period.types'

export function useFiscalPeriodsController() {
  const { periods, isLoading, error } = useFiscalPeriods()
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

  // GL102000 Create Action handled via FiscalPeriodCreateDrawer
  // We can formalize it via command if needed, but it's currently local UI state.

  return {
    ...base,
    periods,
    isLoading,
    gridState,
  }
}
