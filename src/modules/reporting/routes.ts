import type { RouteRecordRaw } from 'vue-router'
import WorkspaceView from '@/platform/navigation/WorkspaceView.vue'
import CashflowDashboard from './ui/CashflowDashboard.vue'
import { reportingWorkspace } from './workspace'

export const reportingRoutes: RouteRecordRaw[] = [
  // --- Workspace (State A) ---
  {
    path: '',
    name: 'reporting-workspace',
    component: WorkspaceView,
    props: { workspace: reportingWorkspace },
  },

  // --- Screens (State B) ---
  {
    path: 'dashboard',
    name: 'reporting.dashboard',
    component: CashflowDashboard,
    meta: {
      title: 'Reporting Dashboard',
      permissions: ['reporting:view'],
    },
  },
]

export default reportingRoutes
