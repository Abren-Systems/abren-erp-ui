import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'

export const ledgerWorkspace: WorkspaceContract = {
  id: 'ledger',
  titleKey: 'General Ledger',
  icon: 'book',
  requiredPermissions: ['ledger:view'],
  tiles: [],
  categories: [
    {
      id: 'transactions',
      labelKey: 'Transactions',
      links: [
        {
          id: 'gl3010pl',
          labelKey: 'Journal Entries',
          screenId: createScreenId('GL3010PL'),
          requiredPermissions: ['ledger:view'],
        },
      ],
    },
    {
      id: 'profiles',
      labelKey: 'Profiles',
      links: [
        {
          id: 'gl2010pl',
          labelKey: 'Chart of Accounts',
          screenId: createScreenId('GL2010PL'),
          requiredPermissions: ['ledger:view'],
        },
      ],
    },
    {
      id: 'settings',
      labelKey: 'Preferences',
      links: [
        {
          id: 'gl101000',
          labelKey: 'Ledger Settings',
          screenId: createScreenId('GL101000'),
          requiredPermissions: ['ledger:manage_accounts'],
        },
        {
          id: 'gl102000',
          labelKey: 'Fiscal Periods',
          screenId: createScreenId('GL102000'),
          requiredPermissions: ['ledger:manage_accounts'],
        },
      ],
    },
  ],
}
