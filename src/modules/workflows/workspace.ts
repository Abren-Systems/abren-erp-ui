import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'

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
          screenId: 'WF301000' as ScreenId,
          requiredPermissions: ['workflows.inbox.view'],
        },
      ],
    },
  ],
}
