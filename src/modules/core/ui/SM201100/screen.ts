import { useRolesController } from './controller'
import { SM201100_COMMANDS_LIST } from './commands'
import type { ModuleId } from '@/shared/types/brand.types'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ScreenDefinition } from '@/platform/screen-runtime'

export const SM201100: ScreenDefinition = {
  id: createScreenId('SM201100'),
  titleKey: 'User Roles',
  kind: 'setup',
  moduleId: 'core' as ModuleId,

  controller: () => useRolesController(),

  test: {
    containerName: 'Roles',
    actionNames: ['create', 'executeCreate'],
    viewNames: ['roles'],
  },

  views: {
    roles: {
      name: 'roles',
      kind: 'collection',
      containerName: 'Roles',
      queryKey: ['core', 'roles'],
    },
  },

  permissions: [{ key: 'core:view' }, { key: 'core:role_edit' }],

  primaryView: 'roles',

  route: {
    path: 'roles',
    name: 'SMRoles',
  },

  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue'),
  },

  commands: SM201100_COMMANDS_LIST,

  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
}
