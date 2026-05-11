import { useTaxRulesListController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import { createScreenId } from '@/platform/screen-runtime'
import type { ModuleId } from '@/shared/types/brand.types'
import { TX2050PL_COMMANDS } from './commands'

export const TX2050PL: ScreenDefinition = {
  id: createScreenId('TX2050PL'),
  moduleId: 'tax' as ModuleId,
  controller: () => useTaxRulesListController(),
  kind: 'primaryList',
  titleKey: 'Taxes',
  primaryView: 'rules',
  route: {
    path: 'taxes',
    name: 'TaxesList',
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
  commands: Object.values(TX2050PL_COMMANDS),
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'TX2050PL',
    viewNames: [],
    actionNames: [],
  },
}
