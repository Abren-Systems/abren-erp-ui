import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'

export const CA2020PL: ScreenDefinition = {
  id: 'CA2020PL' as ScreenId,
  moduleId: 'finance' as ModuleId,
  kind: 'inquiry',
  titleKey: 'Bank Accounts',
  primaryView: 'accounts',
  route: {
    path: 'accounts',
    name: 'finance.bank.accounts',
  },
  permissions: [{ key: 'bank_accounts' }],
  views: {
    accounts: {
      name: 'accounts',
      kind: 'collection',
      containerName: 'BankAccountsList',
      queryKey: ['bank', 'accounts'] as const,
    },
  },
  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue') as never,
    sidePanel: { tabs: [], defaultCollapsed: true },
  },
  commands: [],
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'CA2020PL',
    viewNames: [],
    actionNames: [],
  },
}
