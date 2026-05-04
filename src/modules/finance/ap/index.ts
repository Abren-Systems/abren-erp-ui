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
    {
      label: 'Payment Requests',
      route: 'PaymentRequestsList',
      icon: 'credit-card',
    },
    { label: 'Vendor Bills', route: 'VendorBillsList', icon: 'file-text' },
  ],
}
