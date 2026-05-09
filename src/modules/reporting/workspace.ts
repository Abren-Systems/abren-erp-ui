import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'

export const reportingWorkspace: WorkspaceContract = {
  id: 'reporting',
  titleKey: 'Reporting',
  icon: 'bar-chart-3',
  requiredPermissions: ['reporting:view'],
  tiles: [],
  categories: [
    {
      id: 'dashboards',
      labelKey: 'Dashboards',
      links: [
        {
          id: 'dashboard',
          labelKey: 'Cashflow Insights',
          screenId: createScreenId('dashboard'), // Legacy bypass
          requiredPermissions: ['reporting:view'],
        },
      ],
    },
  ],
}
