import type { PlatformEngine } from '@/shared/types/module.types'
import routes from './routes'

export const workflowsModule: PlatformEngine = {
  id: 'workflows',
  name: 'Workflows',
  category: 'platform',
  routes,
  permissions: ['workflows:read', 'workflows:write'],
  menuItems: [
    { label: 'Inbox', route: 'workflows.inbox', icon: 'inbox', permissions: ['workflows:read'] },
    {
      label: 'States',
      route: 'workflows.states',
      icon: 'git-branch',
      permissions: ['workflows:read'],
    },
  ],
}
