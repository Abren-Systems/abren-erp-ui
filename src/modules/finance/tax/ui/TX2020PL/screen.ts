import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'

export const TX2020PL: ScreenDefinition = {
  id: 'TX2020PL' as ScreenId,
  moduleId: 'tax' as ModuleId,
  kind: 'inquiry',
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
  commands: [],
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
