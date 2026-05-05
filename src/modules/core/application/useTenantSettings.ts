import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { coreAdapter } from '../infrastructure/core_adapter'
import type { TenantSettingDTO } from '../infrastructure/api.types'

export function useTenantSettings() {
  const queryClient = useQueryClient()

  const {
    data: settings,
    isPending: isSettingsPending,
    refetch: refetchSettings,
  } = useQuery<TenantSettingDTO[], Error>({
    queryKey: ['core', 'settings'],
    queryFn: () => coreAdapter.getSettings(),
  })

  const { mutateAsync: updateSetting, isPending: isUpdating } = useMutation({
    mutationFn: (payload: { key: string; value: string | null }) =>
      coreAdapter.updateSetting(payload.key, payload.value),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['core', 'settings'] })
    },
  })

  return {
    settings,
    isSettingsPending,
    refetchSettings,
    updateSetting,
    isUpdating,
  }
}
