import { GL202500_COMMANDS } from './commands'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { AccountId, ModuleId } from '@/shared/types/brand.types'
import { useAccountController } from './controller'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

export const GL202500: ScreenDefinition = {
  id: createScreenId('GL202500'),
  moduleId: 'ledger' as ModuleId,
  controller: (ctx) => useAccountController(ctx.params['id'] as AccountId),
  kind: 'maintenance',
  titleKey: 'Chart of Accounts',
  primaryView: 'account',
  route: {
    path: 'accounts/:id',
    name: 'LedgerCoaDetail',
  },
  permissions: [{ key: 'ledger:manage_accounts' }],
  views: {
    account: {
      name: 'account',
      kind: 'single',
      containerName: 'AccountRecord',
      queryKey: ['ledger', 'accounts', 'detail'] as const,
    },
  },
  layout: {
    summaryTemplate: '1-1',
    renderTarget: () => import('./view.vue') as never,
    sidePanel: {
      tabs: [],
      defaultCollapsed: true,
    },
  },
  commands: GL202500_COMMANDS,
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: false,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'GL202500',
    viewNames: [],
    actionNames: [],
  },
}
