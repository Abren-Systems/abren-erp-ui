import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'
import { CR201000_COMMANDS_LIST } from './commands'
import { useUsersController } from './controller'

export const CR201000: ScreenDefinition = {
  id: 'CR201000' as ScreenId,
  titleKey: 'core.CR201000.title',
  kind: 'setup',
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
    name: 'CoreUsers',
  },

  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue'),
  },

  commands: CR201000_COMMANDS_LIST,

  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
}
