import { useApiQuery } from '@/shared/composables/useApiQuery'
import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
import { LedgerMapper } from '../../infrastructure/mappers'
import type { FiscalPeriod } from '../../domain/fiscal-period.types'
import type { components } from '@/shared/api/generated.types'

type FiscalPeriodCreate = components['schemas']['FiscalPeriodCreate']

/**
 * Use Case: Manage Fiscal Periods.
 *
 * Provides access to the list of financial periods and allows
 * creating new periods for ledger locking.
 */
export function useFiscalPeriods() {
  const queryClient = useQueryClient()

  const {
    data: periods,
    isLoading,
    error,
    refetch,
  } = useApiQuery<FiscalPeriod[]>(['fiscal-periods'], async () => {
    const dtos = await ledgerAdapter.getFiscalPeriods()
    return dtos.map((dto) => LedgerMapper.toFiscalPeriod(dto))
  })

  const { mutateAsync: createPeriod, isPending: isCreating } = useApiMutation<
    FiscalPeriod,
    Error,
    FiscalPeriodCreate
  >(
    async (data: FiscalPeriodCreate) => {
      const dto = await ledgerAdapter.createFiscalPeriod(data)
      return LedgerMapper.toFiscalPeriod(dto)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['fiscal-periods'] })
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
