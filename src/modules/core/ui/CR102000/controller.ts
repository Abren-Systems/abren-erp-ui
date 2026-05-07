import { computed, ref } from 'vue'
import { useScreenController } from '@/platform/screen-runtime'
import { CR102000 } from './screen'
import { CR102000_POLICY } from './policy'
import { useTenantSettings } from '../../application/useTenantSettings'

export interface TenantSetting {
  key: string
  value: string | null
}

export function useTenantSettingsController() {
  const { settings, isSettingsPending } = useTenantSettings()

  const base = useScreenController<{ settings: TenantSetting[] }, 'VIEW'>({
    screen: CR102000,
    dataSource: {
      entity: computed(() => ({ settings: (settings.value as TenantSetting[]) || [] })),
      isLoading: isSettingsPending,
      error: ref(null),
    },
    isNew: computed(() => false),
    getDomainState: () => 'VIEW',
    statePolicy: CR102000_POLICY,
  })

  // Register commands
  base.registerCommand('bulkEdit', {
    execute: async () => {
      console.log('Bulk edit initiated')
    },
    isPending: computed(() => false),
  })

  return {
    ...base,
    settings,
  }
}
