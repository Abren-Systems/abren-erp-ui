import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'

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
          screenId: 'TX2010PL' as ScreenId,
          requiredPermissions: ['tax:view'],
        },
        {
          id: 'tx2020pl',
          labelKey: 'Tax Categories',
          screenId: 'TX2020PL' as ScreenId,
          requiredPermissions: ['tax:view'],
        },
      ],
    },
  ],
}
