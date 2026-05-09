import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

export const coreWorkspace: WorkspaceContract = {
  id: 'core',
  titleKey: 'Organization',
  icon: 'building-2',
  requiredPermissions: ['core:view'],
  tiles: [],
  categories: [
    {
      id: 'identity',
      labelKey: 'Identity & Access',
      links: [
        {
          id: 'cr201000',
          labelKey: 'Users',
          screenId: createScreenId('CR201000'),
          requiredPermissions: ['core:view'],
        },
        {
          id: 'cr101000',
          labelKey: 'Roles',
          screenId: createScreenId('CR101000'),
          requiredPermissions: ['core:view'],
        },
      ],
    },
    {
      id: 'system',
      labelKey: 'System',
      links: [
        {
          id: 'cr102000',
          labelKey: 'Tenants',
          screenId: createScreenId('CR102000'),
          requiredPermissions: ['core:view'],
        },
      ],
    },
  ],
}
