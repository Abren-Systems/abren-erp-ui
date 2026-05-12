import {
  createWorkspaceId,
  type WorkspaceDefinition,
} from '@/platform/navigation-runtime/workspace-definition'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

/** Hub links match `coreModule.menuItems` order (Users → Roles → Companies). */
export const coreWorkspace: WorkspaceDefinition = {
  id: createWorkspaceId('core'),
  titleKey: 'Organization',
  icon: 'building-2',
  category: 'platform',
  requiredPermissions: ['core:view'],
  tiles: [],
  categories: [
    {
      id: 'screens',
      labelKey: 'Screens',
      links: [
        {
          id: 'sm201010',
          labelKey: 'Users',
          screenId: createScreenId('SM201010'),
          requiredPermissions: ['core:view'],
        },
        {
          id: 'sm201100',
          labelKey: 'Roles',
          screenId: createScreenId('SM201100'),
          requiredPermissions: ['core:view'],
        },
        {
          id: 'cs102000',
          labelKey: 'Companies',
          screenId: createScreenId('CS102000'),
          requiredPermissions: ['core:view'],
        },
      ],
    },
  ],
}
