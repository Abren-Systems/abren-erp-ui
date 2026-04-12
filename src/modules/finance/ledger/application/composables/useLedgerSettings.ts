import { useApiQuery } from '@/shared/composables/useApiQuery'
import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
import { ledgerKeys } from '../keys'
import type { ApiError } from '@/shared/api/http-client'
import type { components } from '@/shared/api/generated.types'

type LedgerSettingsRead = components['schemas']['LedgerSettingsRead']
type LedgerSettingsUpdate = components['schemas']['LedgerSettingsUpdate']

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
  } = useApiQuery<LedgerSettingsRead>(ledgerKeys.settings(), () =>
    ledgerAdapter.getLedgerSettings(),
  )

  const {
    mutateAsync: updateSettings,
    isPending: isUpdating,
    error: updateError,
  } = useApiMutation<void, ApiError, LedgerSettingsUpdate>(
    async (data: LedgerSettingsUpdate) => {
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
    isLoading: isFetching || isUpdating,
    error: fetchError || updateError,
    updateSettings,
  }
}
