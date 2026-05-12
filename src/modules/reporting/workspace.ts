import {
  createWorkspaceId,
  type WorkspaceDefinition,
} from '@/platform/navigation-runtime/workspace-definition'

export const reportingWorkspace: WorkspaceDefinition = {
  id: createWorkspaceId('reporting'),
  titleKey: 'Reporting',
  icon: 'bar-chart-3',
  category: 'business',
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
