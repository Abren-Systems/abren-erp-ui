import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

export const workflowWorkspace: WorkspaceContract = {
  id: 'workflows',
  titleKey: 'Workflows',
  icon: 'git-branch',
  requiredPermissions: ['workflows:view'],
  tiles: [],
  categories: [
    {
      id: 'tasks',
      labelKey: 'Tasks',
      links: [
        {
          id: 'ep503010',
          labelKey: 'Approvals',
          screenId: createScreenId('EP503010'),
          requiredPermissions: ['workflows.inbox.view'],
        },
      ],
    },
  ],
}
