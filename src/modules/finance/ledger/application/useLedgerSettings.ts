import { computed } from 'vue'
import { useApiQuery } from '@/shared/composables/useApiQuery'
import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { ledgerAdapter } from '../infrastructure/ledger.adapter'
import { ledgerKeys } from './query-keys'
import type { ApiError } from '@/shared/api/http-client'
import type { LedgerSettingsDTO, UpdateLedgerSettingsDTO } from '../infrastructure/api.types'

/**
 * Use Case: Manage Global Ledger Settings.
 *
 * Provides reactive access to the ledger configuration (bridge accounts,
 * default payable accounts) and mutations to update them.
 *
 * @returns Reactive ledger settings state and update methods.
 * @example
 * const { settings, updateSettings, isLoading } = useLedgerSettings()
 */
export function useLedgerSettings() {
  const queryClient = useQueryClient()

  const {
    data: settings,
    isLoading: isFetching,
    error: fetchError,
  } = useApiQuery<LedgerSettingsDTO>(ledgerKeys.settings(), () => ledgerAdapter.getLedgerSettings())

  const {
    mutateAsync: updateSettings,
    isPending: isUpdating,
    error: updateError,
  } = useApiMutation<void, ApiError, UpdateLedgerSettingsDTO>(
    async (data: UpdateLedgerSettingsDTO) => {
      await ledgerAdapter.updateLedgerSettings(data)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ledgerKeys.settings() })
      },
    },
  )

  return {
    settings,
    isLoading: computed(() => isFetching.value || isUpdating.value),
    error: computed(() => fetchError.value || updateError.value),
    updateSettings,
  }
}
