import { computed } from 'vue'
import { useCashflow } from '../application/useCashflow'
import { BusinessDate } from '@/shared/domain/business-date'
import { TrendingUp, TrendingDown, Clock, Wallet } from 'lucide-vue-next'

export function useCashflowDashboard() {
  const endDate = BusinessDate.today()
  const startDate = BusinessDate.fromIso(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
  )

  const { entries, stats: cashflowStats } = useCashflow({ startDate, endDate })

  const displayStats = computed(() => [
    {
      name: 'Total Actual Inflow',
      value: cashflowStats.value?.totalActualInflow.format() ?? '...',
      icon: TrendingUp,
      color: 'text-[var(--color-success-600)]',
      bg: 'bg-[var(--color-success-50)]',
    },
    {
      name: 'Total Actual Outflow',
      value: cashflowStats.value?.totalActualOutflow.format() ?? '...',
      icon: TrendingDown,
      color: 'text-[var(--color-danger-600)]',
      bg: 'bg-[var(--color-danger-50)]',
    },
    {
      name: 'Projected Exposure',
      value: cashflowStats.value?.projectedExposure.format() ?? '...',
      icon: Clock,
      color: 'text-[var(--color-warning-600)]',
      bg: 'bg-[var(--color-warning-50)]',
    },
    {
      name: 'Net Cash Position',
      value: cashflowStats.value?.netCashPosition.format() ?? '...',
      icon: Wallet,
      color: 'text-[var(--color-primary-600)]',
      bg: 'bg-[var(--color-primary-50)]',
    },
  ])

  return {
    entries,
    cashflowStats,
    displayStats,
  }
}
