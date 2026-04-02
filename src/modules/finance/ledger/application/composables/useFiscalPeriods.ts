import { useApiQuery } from '@/shared/composables/useApiQuery'
import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
import { ledgerKeys } from '../keys'
import { LedgerMapper } from '../../infrastructure/mappers'
import type { FiscalPeriod } from '../../domain/fiscal-period.types'
import type { components } from '@/shared/api/generated.types'
import type { ApiError } from '@/shared/api/http-client'

type FiscalPeriodCreate = components['schemas']['FiscalPeriodCreate']

/**
 * Use Case: Manage Fiscal Periods.
 *
 * Provides access to the list of financial periods and allows
 * creating new periods for ledger locking.
 *
 * @returns Reactive fiscal periods state and creation methods.
 * @example
 * const { periods, createPeriod, isLoading } = useFiscalPeriods()
 */
export function useFiscalPeriods() {
  const queryClient = useQueryClient()

  const {
    data: periods,
    isLoading,
    error,
    refetch,
  } = useApiQuery<FiscalPeriod[]>(ledgerKeys.fiscalPeriods(), async () => {
    const dtos = await ledgerAdapter.getFiscalPeriods()
    return dtos.map((dto) => LedgerMapper.toFiscalPeriod(dto))
  })

  const { mutateAsync: createPeriod, isPending: isCreating } = useApiMutation<
    FiscalPeriod,
    ApiError,
    FiscalPeriodCreate
  >(
    async (data: FiscalPeriodCreate) => {
      const dto = await ledgerAdapter.createFiscalPeriod(data)
      return LedgerMapper.toFiscalPeriod(dto)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ledgerKeys.fiscalPeriods() })
      },
    },
  )

  return {
    periods,
    isLoading: isLoading || isCreating,
    error,
    refresh: refetch,
    createPeriod,
  }
}
