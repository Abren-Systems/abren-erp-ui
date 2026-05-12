import {
  createWorkspaceId,
  type WorkspaceDefinition,
} from '@/platform/navigation-runtime/workspace-definition'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

export const bankWorkspace: WorkspaceDefinition = {
  id: createWorkspaceId('bank'),
  titleKey: 'Banking',
  icon: 'landmark',
  category: 'business',
  requiredPermissions: ['bank:view'],
  tiles: [],
  categories: [
    {
      id: 'profiles',
      labelKey: 'Profiles',
      links: [
        {
          id: 'ca2020pl',
          labelKey: 'Cash Accounts',
          screenId: createScreenId('CA2020PL'),
          requiredPermissions: ['bank:view'],
        },
      ],
    },
  ],
}
