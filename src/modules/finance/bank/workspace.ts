import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'

export const bankWorkspace: WorkspaceContract = {
  id: 'bank',
  titleKey: 'Banking',
  icon: 'landmark',
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
          screenId: 'CA2020PL' as ScreenId,
          requiredPermissions: ['bank:view'],
        },
      ],
    },
  ],
}
