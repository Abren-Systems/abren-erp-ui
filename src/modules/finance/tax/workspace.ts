import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

export const taxWorkspace: WorkspaceContract = {
  id: 'tax',
  titleKey: 'Taxes',
  icon: 'calculator',
  requiredPermissions: ['finance:tax:view'],
  tiles: [],
  categories: [
    {
      id: 'profiles',
      labelKey: 'Profiles',
      links: [
        {
          id: 'tx2050pl',
          labelKey: 'Taxes',
          screenId: createScreenId('TX2050PL'),
          requiredPermissions: ['finance:tax:view'],
        },
        {
          id: 'tx2055pl',
          labelKey: 'Tax Groups',
          screenId: createScreenId('TX2055PL'),
          requiredPermissions: ['finance:tax:view'],
        },
      ],
    },
  ],
}
