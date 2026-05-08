import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'

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
          screenId: 'GL3010PL' as ScreenId,
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
          screenId: 'GL2010PL' as ScreenId,
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
          screenId: 'GL101000' as ScreenId,
          requiredPermissions: ['ledger:manage_accounts'],
        },
        {
          id: 'gl102000',
          labelKey: 'Fiscal Periods',
          screenId: 'GL102000' as ScreenId,
          requiredPermissions: ['ledger:manage_accounts'],
        },
      ],
    },
  ],
}
