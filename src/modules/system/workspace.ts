import {
  createWorkspaceId,
  type WorkspaceDefinition,
} from '@/platform/navigation-runtime/workspace-definition'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

export const workflowWorkspace: WorkspaceDefinition = {
  id: createWorkspaceId('workflows'),
  titleKey: 'Workflows',
  icon: 'git-branch',
  category: 'platform',
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
