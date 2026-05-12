import type { BusinessDomain } from '@/shared/types/module.types'
import routes from './routes'

export const reportingModule: BusinessDomain = {
  id: 'reporting',
  name: 'Reporting',
  category: 'business',
  routes,
  permissions: ['reporting:view'],
  icon: 'bar-chart-3',
}
