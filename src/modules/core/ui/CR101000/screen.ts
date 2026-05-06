import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'
import { roleCommands } from './commands'
import { useRolesController } from './controller'

export const CR101000: ScreenDefinition = {
  id: 'CR101000' as ScreenId,
  titleKey: 'core.CR101000.title',
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
    path: '/roles',
    name: 'CoreRoles',
  },

  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue'),
  },

  commands: roleCommands,

  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
}
