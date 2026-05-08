import { useBankAccountController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'
import { CA202000_COMMANDS } from './commands'

export const CA202000: ScreenDefinition = {
  id: 'CA202000' as ScreenId,
  moduleId: 'bank' as ModuleId,
  controller: (ctx) => useBankAccountController(ctx.params['id'] as string),
  kind: 'maintenance',
  titleKey: 'Bank Account',
  primaryView: 'account',
  route: {
    path: 'accounts/:id',
    name: 'finance.bank.account',
  },
  permissions: [{ key: 'bank_accounts' }],
  views: {
    account: {
      name: 'account',
      kind: 'single',
      containerName: 'BankAccountRecord',
      queryKey: ['bank', 'accounts', 'detail'] as const,
    },
  },
  layout: {
    summaryTemplate: '17-17-14',
    renderTarget: () => import('./view.vue') as never,
    sidePanel: { tabs: [], defaultCollapsed: true },
  },
  commands: CA202000_COMMANDS,
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: false,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'CA202000',
    viewNames: [],
    actionNames: [],
  },
}
