import { useQuery } from '@tanstack/vue-query'
import { reportingAdapter } from '../../infrastructure/reporting_adapter'
import type { CashflowQuery } from '../../infrastructure/api.types'
import { ReportingMapper } from '../../infrastructure/mappers'
import { Money } from '@/shared/domain/money'
import { Currency } from '@/shared/domain/currency'
import type { CashflowStats } from '../../domain/reporting.types'
import { computed } from 'vue'

/**
 * Use Case: View Daily Cashflow Dashboard.
 *
 * Orchestrates fetching daily cashflow data and mapping it to
 * UI-ready ViewModels and aggregated statistics.
 *
 * @returns Reactive dashboard data including entries and aggregated stats.
 * @example
 * const { entries, stats, isLoading } = useCashflow({
 *   startDate: '2026-01-01',
 *   endDate: '2026-01-31'
 * })
 */
export function useCashflow(query: CashflowQuery) {
  const {
    data: entries,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reporting', 'cashflow', query],
    queryFn: async () => {
      const dtos = await reportingAdapter.getDailyCashflow(query)
      return dtos.map((dto) => ReportingMapper.toDailyCashflowEntry(dto))
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  /**
   * Aggregates stats from the fetched entries.
   */
  const stats = computed<CashflowStats | null>(() => {
    const entriesValue = entries.value
    if (!entriesValue || entriesValue.length === 0) return null

    const currency = entriesValue[0]!.actualInflow.currency as Currency
    let totalIn = Money.zero(currency)
    let totalOut = Money.zero(currency)
    let totalProjectedIn = Money.zero(currency)
    let totalProjectedOut = Money.zero(currency)

    for (const entry of entries.value) {
      totalIn = totalIn.add(entry.actualInflow)
      totalOut = totalOut.add(entry.actualOutflow)
      totalProjectedIn = totalProjectedIn.add(entry.projectedInflow)
      totalProjectedOut = totalProjectedOut.add(entry.projectedOutflow)
    }

    return {
      totalActualInflow: totalIn,
      totalActualOutflow: totalOut,
      projectedExposure: totalProjectedIn.subtract(totalProjectedOut),
      netCashPosition: totalIn.subtract(totalOut),
    }
  })

  return {
    entries,
    stats,
    isLoading,
    error,
    refresh: refetch,
  }
}
