import type { ScreenDefinition } from '@/platform/screen-runtime'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'
import { SM201010_COMMANDS_LIST } from './commands'
import { useUsersController } from './controller'

export const SM201010: ScreenDefinition = {
  id: createScreenId('SM201010'),
  titleKey: 'Users',
  kind: 'primaryList',
  moduleId: 'core' as ModuleId,

  controller: () => useUsersController(),

  test: {
    containerName: 'Users',
    actionNames: ['invite', 'executeInvite', 'executeAssign'],
    viewNames: ['users'],
  },

  views: {
    users: {
      name: 'users',
      kind: 'collection',
      containerName: 'Users',
      queryKey: ['core', 'users'],
    },
  },

  permissions: [{ key: 'core:view' }, { key: 'core:user_edit' }],

  primaryView: 'users',

  route: {
    path: 'users',
    name: 'SMUsers',
  },

  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue'),
  },

  commands: SM201010_COMMANDS_LIST,

  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
}
