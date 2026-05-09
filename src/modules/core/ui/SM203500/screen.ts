import type { ModuleId } from '@/shared/types/brand.types'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import { SM203500_COMMANDS_LIST } from './commands'
import { useTenantSettingsController } from './controller'

export const SM203500: ScreenDefinition = {
  id: createScreenId('SM203500'),
  titleKey: 'Companies',
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
    name: 'SMCompanies',
  },

  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue'),
  },

  commands: SM203500_COMMANDS_LIST,

  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
}
