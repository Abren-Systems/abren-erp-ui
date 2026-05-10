import type { BusinessDomain } from '@/shared/types/module.types'
import routes from './routes'
import { apScreens } from './screens'

export const apModule: BusinessDomain = {
  id: 'ap',
  name: 'Accounts Payable',
  category: 'business',
  screens: apScreens,
  routes,
  permissions: ['ap:view'], // Consolidates ap:view
  menuItems: [
    { label: 'Bills and Adjustments', route: 'BillsAndAdjustmentsList', icon: 'file-text' },
    {
      label: 'Payment Requests',
      route: 'PaymentRequestsList',
      icon: 'credit-card',
    },
  ],
}
