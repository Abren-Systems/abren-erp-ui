import type { BusinessDomain } from '@/shared/types/module.types'
import routes from './routes'
import { arScreenDefinitions } from './screens'

export const arModule: BusinessDomain = {
  id: 'ar',
  name: 'Accounts Receivable',
  category: 'business',
  screens: arScreenDefinitions,
  routes,
  permissions: ['ar:view', 'ar:create_invoice', 'ar:release_invoice'],
  icon: 'file-text',
}
