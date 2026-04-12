import type { RouteRecordRaw } from 'vue-router'
import CashflowDashboard from './ui/CashflowDashboard.vue'

export const reportingRoutes: RouteRecordRaw[] = [
  {
    path: '/business/reporting',
    name: 'reporting.dashboard',
    component: CashflowDashboard,
    meta: {
      title: 'Reporting Dashboard',
      requiresAuth: true,
      module: 'reporting',
    },
  },
]

export default reportingRoutes
