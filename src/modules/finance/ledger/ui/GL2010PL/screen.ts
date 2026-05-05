import type { ScreenDefinition } from '@/platform/screen-runtime'

import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'

export const GL2010PL: ScreenDefinition = {
  id: 'GL2010PL' as ScreenId,
  moduleId: 'ledger' as ModuleId,
  kind: 'inquiry',
  titleKey: 'Chart of Accounts List',
  primaryView: 'accounts',
  route: {
    path: 'accounts',
    name: 'LedgerCoa',
  },
  permissions: [{ key: 'ledger:manage_accounts' }],
  views: {
    accounts: {
      name: 'accounts',
      kind: 'collection',
      containerName: 'AccountsList',
      queryKey: ['ledger', 'accounts', 'list'] as const,
    },
  },
  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue') as never,
    sidePanel: {
      tabs: [],
      defaultCollapsed: true,
    },
  },
  commands: [],
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'GL2010PL',
    viewNames: [],
    actionNames: [],
  },
}
