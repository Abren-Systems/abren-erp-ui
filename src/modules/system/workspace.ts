import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import { createScreenId } from '@/platform/screen-runtime'

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
          id: 'wf301000',
          labelKey: 'Workflow Inbox',
          screenId: createScreenId('WF301000'),
          requiredPermissions: ['workflows.inbox.view'],
        },
      ],
    },
  ],
}
