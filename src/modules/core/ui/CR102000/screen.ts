import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'
import { CR102000_COMMANDS_LIST } from './commands'
import { useTenantSettingsController } from './controller'

export const CR102000: ScreenDefinition = {
  id: 'CR102000' as ScreenId,
  titleKey: 'core.CR102000.title',
  kind: 'setup',
  moduleId: 'core' as ModuleId,

  controller: () => useTenantSettingsController(),

  test: {
    containerName: 'Settings',
    actionNames: ['bulkEdit'],
    viewNames: ['settings'],
  },

  views: {
    settings: {
      name: 'settings',
      kind: 'collection',
      containerName: 'Settings',
      queryKey: ['core', 'tenantSettings'],
    },
  },

  permissions: [{ key: 'core:view' }, { key: 'core:tenant_edit' }],

  primaryView: 'settings',

  route: {
    path: 'tenants',
    name: 'CoreTenants',
  },

  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue'),
  },

  commands: CR102000_COMMANDS_LIST,

  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
}
