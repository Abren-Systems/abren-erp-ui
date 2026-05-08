import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { useQueryClient } from '@tanstack/vue-query'
import { ledgerAdapter } from '../infrastructure/ledger.adapter'
import { ledgerKeys } from './query-keys'
import { LedgerMapper } from '../infrastructure/mappers'
import type { FiscalPeriod } from '../domain/fiscal-period.types'
import type { ApiError } from '@/shared/api/http-client'
import type { CreateFiscalPeriodDTO } from '../infrastructure/api.types'

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
  } = useResourceQuery(
    ledgerKeys.fiscalPeriods(),
    () => ledgerAdapter.getFiscalPeriods(),
    (dtos) => dtos.map((dto) => LedgerMapper.toFiscalPeriod(dto)),
  )

  const { mutateAsync: createPeriod, isPending: isCreating } = useApiMutation<
    FiscalPeriod,
    ApiError,
    CreateFiscalPeriodDTO
  >(
    async (data: CreateFiscalPeriodDTO) => {
      const dto = await ledgerAdapter.createFiscalPeriod(data)
      return LedgerMapper.toFiscalPeriod(dto)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: ledgerKeys.fiscalPeriods(),
        })
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
