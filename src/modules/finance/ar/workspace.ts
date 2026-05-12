import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import {
  createWorkspaceId,
  type WorkspaceDefinition,
} from '@/platform/navigation-runtime/workspace-definition'

export const arWorkspace: WorkspaceDefinition = {
  id: createWorkspaceId('ar'),
  titleKey: 'Receivables',
  icon: 'file-text',
  category: 'business',
  requiredPermissions: ['ar:view'],
  tiles: [],
  categories: [
    {
      id: 'transactions',
      labelKey: 'Transactions',
      links: [
        {
          id: 'ar3010pl',
          labelKey: 'Invoices and Memos',
          screenId: createScreenId('AR3010PL'),
          requiredPermissions: ['ar:view'],
        },
      ],
    },
  ],
}
