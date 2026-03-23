import type { PlatformEngine } from '@/core/types/module.types'

export const workflowsModule: PlatformEngine = {
  id: 'workflows',
  name: 'Workflows',
  category: 'platform',
  routes: () => import('./routes').then((m) => m.default),
  permissions: ['workflows.view'],
  menuItems: [{ label: 'States', route: 'WorkflowsStates', icon: 'git-branch' }],
}
