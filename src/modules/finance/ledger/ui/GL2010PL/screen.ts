import type { ScreenDefinition } from '@/platform/screen-runtime'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'
import { useAccountListController } from './controller'
import { GL2010PL_COMMANDS } from './commands'

export const GL2010PL: ScreenDefinition = {
  id: createScreenId('GL2010PL'),
  moduleId: 'ledger' as ModuleId,
  controller: () => useAccountListController(),
  kind: 'primaryList',
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
  commands: GL2010PL_COMMANDS,
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
