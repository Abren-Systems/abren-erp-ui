import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import {
  createWorkspaceId,
  type WorkspaceDefinition,
} from '@/platform/navigation-runtime/workspace-definition'

export const apWorkspace: WorkspaceDefinition = {
  id: createWorkspaceId('ap'),
  titleKey: 'Payables',
  icon: 'credit-card',
  category: 'business',
  requiredPermissions: ['ap:view'],
  tiles: [
    {
      id: 'new-bill',
      labelKey: 'New Bill',
      icon: 'file-text',
      screenId: createScreenId('AP301000'), // Assuming 301000 is entry
    },
    {
      id: 'new-payment',
      labelKey: 'New Payment',
      icon: 'credit-card',
      screenId: createScreenId('AP302000'),
    },
  ],
  categories: [
    {
      id: 'transactions',
      labelKey: 'Transactions',
      links: [
        {
          id: 'ap3010pl',
          labelKey: 'Bills and Adjustments',
          screenId: createScreenId('AP3010PL'),
          requiredPermissions: ['ap:view'],
        },
        {
          id: 'ap3015pl',
          labelKey: 'Payment Requests',
          screenId: createScreenId('AP3015PL'),
          requiredPermissions: ['ap:view'],
        },
      ],
    },
  ],
}
