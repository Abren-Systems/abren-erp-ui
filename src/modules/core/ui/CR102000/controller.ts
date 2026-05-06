import { ref, watch } from 'vue'
import { useScreenController, type ScreenController } from '@/platform/screen-runtime'
import { LIST_SCREEN_POLICY } from '@/platform/screen-runtime/common-policies'
import { CR102000 } from './screen'
import { tenantCommands } from './commands'
import { useTenantSettings } from '../../application/useTenantSettings'

// Using a basic interface since the domain type wasn't exported in the legacy component
export interface TenantSetting {
  key: string
  value: string | null
}

export type TenantSettingsController = ScreenController<{ settings: TenantSetting[] }, 'VIEW'>

export function useTenantSettingsController(): TenantSettingsController {
  const { settings, isSettingsPending } = useTenantSettings()

  const controller = useScreenController<{ settings: TenantSetting[] }, 'VIEW'>({
    screen: CR102000,
    dataSource: {
      entity: ref({ settings: (settings.value as TenantSetting[]) || [] }), // Wrap array
      isLoading: isSettingsPending,
      error: ref(null),
    },
    getDomainState: () => 'VIEW',
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Watch for settings updates
  watch(settings, (newSettings) => {
    controller.entity.value = { settings: (newSettings as TenantSetting[]) || [] }
  })

  // Register commands
  tenantCommands.forEach((cmd) => {
    if (cmd.key === 'bulkEdit') {
      controller.registerCommand(cmd.key, {
        isPending: ref(false),
        execute: async () => {
          // Placeholder for bulk edit action
          console.log('Bulk edit initiated')
        },
      })
    }
  })

  return {
    ...controller,
  }
}
