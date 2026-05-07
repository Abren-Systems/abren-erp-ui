import { useDataGrid } from '@/shared/components/data-grid'
import { computed } from 'vue'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { CR102000 } from './screen'
import { useTenantSettings } from '../../application/useTenantSettings'

export interface TenantSetting {
  key: string
  value: string | null
}

export function useTenantSettingsController() {
  const gridState = useDataGrid()
  const { settings, isSettingsPending, settingsError } = useTenantSettings()

  const base = useScreenController<{ settings: TenantSetting[] }, 'VIEW'>({
    screen: CR102000,
    dataSource: {
      entity: computed(() => ({ settings: (settings.value as TenantSetting[]) || [] })),
      isLoading: isSettingsPending,
      error: settingsError,
    },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Register commands
  base.registerCommand('bulkEdit', {
    execute: async () => {
      console.warn('[TODO] Bulk edit not yet implemented')
    },
    isPending: computed(() => false),
  })

  return {
    ...base,
    settings,
    gridState,
}
}
