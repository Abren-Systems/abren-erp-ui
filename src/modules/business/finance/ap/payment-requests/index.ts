import type { BusinessDomain } from '@/core/types/module.types'

export const paymentRequestsModule: BusinessDomain = {
  id: 'payment-requests',
  name: 'Payment Requests',
  category: 'business',
  routes: () => import('./routes').then((m) => m.default),
  permissions: ['payment_requests.view'],
  menuItems: [{ label: 'Requests', route: 'PaymentRequestsList', icon: 'credit-card' }],
}
