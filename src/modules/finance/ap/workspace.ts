import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'

export const apWorkspace: WorkspaceContract = {
  id: 'ap',
  titleKey: 'Payables',
  icon: 'credit-card',
  requiredPermissions: ['ap:view'],
  tiles: [],
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
