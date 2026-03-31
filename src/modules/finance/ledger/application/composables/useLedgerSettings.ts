import { ref, onMounted } from 'vue'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
import type { components } from '@/shared/api/generated.types'

type LedgerSettingsRead = components['schemas']['LedgerSettingsRead']
type LedgerSettingsUpdate = components['schemas']['LedgerSettingsUpdate']

/**
 * Composable for managing global Ledger Settings.
 */
export function useLedgerSettings() {
  const settings = ref<LedgerSettingsRead | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchSettings = async () => {
    isLoading.value = true
    error.value = null
    try {
      settings.value = await ledgerAdapter.getLedgerSettings()
    } catch (err) {
      error.value = 'Failed to load ledger settings'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const updateSettings = async (data: LedgerSettingsUpdate) => {
    isLoading.value = true
    try {
      settings.value = await ledgerAdapter.updateLedgerSettings(data)
    } catch (err) {
      error.value = 'Failed to update settings'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    void fetchSettings()
  })

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    updateSettings,
  }
}
