import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import {
  createWorkspaceId,
  type WorkspaceDefinition,
} from '@/platform/navigation-runtime/workspace-definition'

/**
 * Hub links mirror the sidebar menu (`ledgerModule.menuItems`) in the same order,
 * grouped by IA (calendar → master data → transactions → preferences).
 */
export const ledgerWorkspace: WorkspaceDefinition = {
  id: createWorkspaceId('ledger'),
  titleKey: 'General Ledger',
  icon: 'book',
  category: 'business',
  requiredPermissions: ['ledger:view'],
  tiles: [
    {
      id: 'new-journal-entry',
      labelKey: 'New Journal Entry',
      icon: 'book-open',
      screenId: createScreenId('GL301000'),
    },
  ],
  categories: [
    {
      id: 'setup',
      labelKey: 'Setup',
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
      labelKey: 'Profiles',
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
      id: 'setup',
      labelKey: 'Setup',
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
