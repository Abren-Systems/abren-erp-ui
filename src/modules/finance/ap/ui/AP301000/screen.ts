import type { ScreenDefinition } from '@/platform/screen-runtime'
import { AP_MODULE_ID, apScreenId } from '../../screens'

/**
 * AP301000 — Payment Request Data Entry (Focus)
 *
 * Acumatica screen kind: dataEntry
 * Transaction creation and editing with summary area, tabs, and line grid.
 * Current render target: view.vue
 */
export const AP301000: ScreenDefinition = {
  id: apScreenId('AP301000'),
  moduleId: AP_MODULE_ID,
  kind: 'dataEntry',
  titleKey: 'ap.paymentRequests.focus.title',
  primaryView: 'paymentRequest',
  route: {
    path: 'requests/:id',
    name: 'PaymentRequestDetail',
  },
  permissions: [{ key: 'ap:view' }],
  views: {
    paymentRequest: {
      name: 'paymentRequest',
      kind: 'single',
      containerName: 'PaymentRequestEntry',
      queryKey: ['ap', 'payment-requests', 'detail'] as const,
    },
    lines: {
      name: 'lines',
      kind: 'collection',
      containerName: 'PaymentRequestLines',
      queryKey: ['ap', 'payment-requests', 'lines'] as const,
    },
  },
  layout: {
    summaryTemplate: '7-10-7',
    renderTarget: () => import('./view.vue') as never,
    sidePanel: {
      tabs: [
        {
          kind: 'local',
          id: 'audit',
          labelKey: 'Trace',
          icon: 'History',
          component: () => import('./sidepanels/audit.vue'),
        },
      ],
      defaultCollapsed: true,
    },
  },
  commands: [],
  personalization: {
    allowTabPersonalization: true,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: true,
  },
  test: {
    containerName: 'PaymentRequestEntry',
    viewNames: ['paymentRequest', 'lines'],
    actionNames: ['save', 'delete', 'submit', 'approve', 'reject', 'release'],
  },
}
