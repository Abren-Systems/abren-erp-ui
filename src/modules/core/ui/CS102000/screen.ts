import type { ModuleId } from '@/shared/types/brand.types'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import { CS102000_COMMANDS_LIST } from './commands'
import { useTenantSettingsController } from './controller'

export const CS102000: ScreenDefinition = {
  id: createScreenId('CS102000'),
  titleKey: 'Companies',
  kind: 'maintenance',
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
    path: 'companies',
    name: 'CSCompanies',
  },

  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue'),
  },

  commands: CS102000_COMMANDS_LIST,

  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
}
