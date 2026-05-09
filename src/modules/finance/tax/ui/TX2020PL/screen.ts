import { useTaxRulesListController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import { createScreenId } from '@/platform/screen-runtime'
import type { ModuleId } from '@/shared/types/brand.types'
import { TX2020PL_COMMANDS } from './commands'

export const TX2020PL: ScreenDefinition = {
  id: createScreenId('TX2020PL'),
  moduleId: 'tax' as ModuleId,
  controller: () => useTaxRulesListController(),
  kind: 'primaryList',
  titleKey: 'Tax Rules',
  primaryView: 'rules',
  route: {
    path: 'rules',
    name: 'finance.tax.rules',
  },
  permissions: [{ key: 'finance:tax:view' }],
  views: {
    rules: {
      name: 'rules',
      kind: 'collection',
      containerName: 'TaxRulesList',
      queryKey: ['tax', 'rules'] as const,
    },
  },
  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue') as never,
    sidePanel: { tabs: [], defaultCollapsed: true },
  },
  commands: Object.values(TX2020PL_COMMANDS),
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'TX2020PL',
    viewNames: [],
    actionNames: [],
  },
}
