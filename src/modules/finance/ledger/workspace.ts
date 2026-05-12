import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'

/**
 * Hub links mirror the sidebar menu (`ledgerModule.menuItems`) in the same order,
 * grouped by IA (calendar → master data → transactions → preferences).
 */
export const ledgerWorkspace: WorkspaceContract = {
  id: 'ledger',
  titleKey: 'General Ledger',
  icon: 'book',
  requiredPermissions: ['ledger:view'],
  tiles: [],
  categories: [
    {
      id: 'fiscal',
      labelKey: 'Fiscal setup',
      links: [
        {
          id: 'gl101000',
          labelKey: 'Financial Year',
          screenId: createScreenId('GL101000'),
          requiredPermissions: ['ledger:manage_fiscal_years'],
        },
        {
          id: 'gl201000',
          labelKey: 'Master Financial Calendar',
          screenId: createScreenId('GL201000'),
          requiredPermissions: ['ledger:view'],
        },
        {
          id: 'gl503000',
          labelKey: 'Manage Financial Periods',
          screenId: createScreenId('GL503000'),
          requiredPermissions: ['ledger:manage_fiscal_periods'],
        },
      ],
    },
    {
      id: 'profiles',
      labelKey: 'Master data',
      links: [
        {
          id: 'gl2025pl',
          labelKey: 'Chart of Accounts',
          screenId: createScreenId('GL2025PL'),
          requiredPermissions: ['ledger:view'],
        },
      ],
    },
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
      id: 'settings',
      labelKey: 'Preferences',
      links: [
        {
          id: 'gl102000',
          labelKey: 'GL Preferences',
          screenId: createScreenId('GL102000'),
          requiredPermissions: ['ledger:manage_accounts'],
        },
      ],
    },
  ],
}
