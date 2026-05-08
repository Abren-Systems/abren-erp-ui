import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'

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
          screenId: 'dashboard' as unknown as ScreenId, // Legacy bypass
          requiredPermissions: ['reporting:view'],
        },
      ],
    },
  ],
}
