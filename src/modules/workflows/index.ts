import type { PlatformEngine } from '@/shared/types/module.types'
import routes from './routes'

export const workflowsModule: PlatformEngine = {
  id: 'workflows',
  name: 'Workflows',
  category: 'platform',
  routes,
  permissions: ['workflows.view'],
  menuItems: [
    { label: 'Inbox', route: 'WorkflowInbox', icon: 'inbox' },
    { label: 'States', route: 'WorkflowsStates', icon: 'git-branch' },
  ],
}
