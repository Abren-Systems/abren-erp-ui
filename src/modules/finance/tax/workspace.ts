import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import { createScreenId } from '@/platform/screen-runtime'

export const taxWorkspace: WorkspaceContract = {
  id: 'tax',
  titleKey: 'Taxes',
  icon: 'calculator',
  requiredPermissions: ['tax:view'],
  tiles: [],
  categories: [
    {
      id: 'profiles',
      labelKey: 'Profiles',
      links: [
        {
          id: 'tx2010pl',
          labelKey: 'Tax Zones',
          screenId: createScreenId('TX2010PL'),
          requiredPermissions: ['tax:view'],
        },
        {
          id: 'tx2020pl',
          labelKey: 'Tax Categories',
          screenId: createScreenId('TX2020PL'),
          requiredPermissions: ['tax:view'],
        },
      ],
    },
  ],
}
