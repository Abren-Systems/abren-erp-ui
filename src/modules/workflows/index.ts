import type { PlatformEngine } from '@/shared/types/module.types'
import routes from './routes'

export const workflowsModule: PlatformEngine = {
  id: 'workflows',
  name: 'Workflows',
  category: 'platform',
  routes,
  permissions: ['workflows:view', 'workflows:approve'],
  menuItems: [
    {
      label: 'Inbox',
      route: 'workflows.inbox',
      icon: 'inbox',
      permissions: ['workflows:view'],
    },
    // {
    //   label: 'States',
    //   route: 'workflows.states',
    //   icon: 'git-branch',
    //   permissions: ['workflows:view'],
    // },
  ],
}
