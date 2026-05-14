import { usePaymentRequestList } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import { AP_MODULE_ID, apScreenId } from '../../constants'
import { AP3015PL_COMMANDS_LIST } from './commands'

/**
 * AP3015PL — Payment Requests Workspace (List)
 *
 * Acumatica screen kind: primaryList
 * Dense list scanning with saved filters and navigation to AP301500.
 * Current render target: view.vue
 */
export const AP3015PL: ScreenDefinition = {
  id: apScreenId('AP3015PL'),
  moduleId: AP_MODULE_ID,
  controller: () => usePaymentRequestList(),
  kind: 'primaryList',
  titleKey: 'Payment Requests',
  primaryView: 'paymentRequests',
  route: {
    path: 'requests',
    name: 'PaymentRequestList',
  },
  permissions: [{ key: 'ap:view' }],
  views: {
    paymentRequests: {
      name: 'paymentRequests',
      kind: 'collection',
      containerName: 'PaymentRequestsList',
      queryKey: ['ap', 'payment-requests'] as const,
    },
  },
  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue') as never,
  },
  commands: AP3015PL_COMMANDS_LIST,
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: true,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'PaymentRequestsList',
    viewNames: ['paymentRequests'],
    actionNames: ['create', 'refresh'],
  },
}
