import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { useQueryClient } from '@tanstack/vue-query'
import { ledgerAdapter } from '../infrastructure/ledger.adapter'
import { ledgerKeys } from './query-keys'
import { LedgerMapper } from '../infrastructure/mappers'
import type { FiscalYear } from '../domain/fiscal-calendar.types'
import type { GenerateFiscalYearDTO } from '../infrastructure/api.types'
import type { ApiError } from '@/shared/api/http-client'

/**
 * Use Case: Manage Fiscal Calendar (Years and Periods).
 *
 * Provides access to the list of financial years and their periods.
 * Allows generating new fiscal years atomically.
 *
 * @returns Reactive fiscal calendar state and generation methods.
 */
export function useFiscalCalendar() {
  const queryClient = useQueryClient()

  const {
    data: years,
    isLoading: isLoadingYears,
    error: yearsError,
    refetch: refreshYears,
  } = useResourceQuery(
    ['ledger', 'fiscal-years'],
    () => ledgerAdapter.getFiscalYears(),
    (dtos) => dtos.map((dto) => LedgerMapper.toFiscalYear(dto)),
  )

  const { mutateAsync: generateYear, isPending: isGenerating } = useApiMutation<
    FiscalYear,
    ApiError,
    GenerateFiscalYearDTO
  >(
    async (data: GenerateFiscalYearDTO) => {
      const dto = await ledgerAdapter.generateFiscalYear(data)
      return LedgerMapper.toFiscalYear(dto)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: ['ledger', 'fiscal-years'],
        })
        void queryClient.invalidateQueries({
          queryKey: ledgerKeys.fiscalPeriods(),
        })
      },
    },
  )

  return {
    years,
    isLoading: isLoadingYears || isGenerating,
    error: yearsError,
    refresh: refreshYears,
    generateYear,
    isGenerating,
    // Period Actions
    closePeriod: (id: string) => ledgerAdapter.closePeriod(id).then(() => refreshYears()),
    openPeriod: (id: string) => ledgerAdapter.openPeriod(id).then(() => refreshYears()),
    lockPeriod: (id: string) => ledgerAdapter.lockPeriod(id).then(() => refreshYears()),
    unlockPeriod: (id: string) => ledgerAdapter.unlockPeriod(id).then(() => refreshYears()),
    // Year Actions
    closeYear: (id: string) => ledgerAdapter.closeYear(id).then(() => refreshYears()),
    openYear: (id: string) => ledgerAdapter.openYear(id).then(() => refreshYears()),
    lockYear: (id: string) => ledgerAdapter.lockYear(id).then(() => refreshYears()),
    unlockYear: (id: string) => ledgerAdapter.unlockYear(id).then(() => refreshYears()),
  }
}
