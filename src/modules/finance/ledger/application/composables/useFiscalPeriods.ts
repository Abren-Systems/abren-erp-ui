import { ref, onMounted } from 'vue'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
import type { components } from '@/shared/api/generated.types'

type FiscalPeriodRead = components['schemas']['FiscalPeriodRead']
type FiscalPeriodCreate = components['schemas']['FiscalPeriodCreate']

/**
 * Composable for managing Fiscal Periods.
 */
export function useFiscalPeriods() {
  const periods = ref<FiscalPeriodRead[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchPeriods = async () => {
    isLoading.value = true
    error.value = null
    try {
      periods.value = await ledgerAdapter.getFiscalPeriods()
    } catch (err) {
      error.value = 'Failed to load fiscal periods'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const createPeriod = async (data: FiscalPeriodCreate) => {
    isLoading.value = true
    try {
      const newPeriod = await ledgerAdapter.createFiscalPeriod(data)
      periods.value.push(newPeriod)
      return newPeriod
    } catch (err) {
      error.value = 'Failed to create fiscal period'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    void fetchPeriods()
  })

  return {
    periods,
    isLoading,
    error,
    fetchPeriods,
    createPeriod,
  }
}
