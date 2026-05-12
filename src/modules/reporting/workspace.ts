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
          id: 'cashflow-dashboard',
          labelKey: 'Cashflow Insights',
          routeName: 'reporting.dashboard',
          requiredPermissions: ['reporting:view'],
        },
      ],
    },
  ],
}
