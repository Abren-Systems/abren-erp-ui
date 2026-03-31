import type { ModuleDefinition } from '@/shared/types/module.types'
import routes from './routes'
import CashflowDashboard from './ui/CashflowDashboard.vue'

export const reportingModule: ModuleDefinition = {
  id: 'reporting',
  name: 'Reporting & Analytics',
  category: 'business',
  routes,
  permissions: ['reporting.view'],
  menuItems: [{ label: 'Cashflow Insights', route: 'reporting.dashboard', icon: 'bar-chart-3' }],
}

export { CashflowDashboard }
