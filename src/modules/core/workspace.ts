import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'

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
          screenId: 'CR201000' as ScreenId,
          requiredPermissions: ['core:view'],
        },
        {
          id: 'cr101000',
          labelKey: 'Roles',
          screenId: 'CR101000' as ScreenId,
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
          screenId: 'CR102000' as ScreenId,
          requiredPermissions: ['core:view'],
        },
      ],
    },
  ],
}
