import { useTaxRuleController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'

export const TX202000: ScreenDefinition = {
  id: 'TX202000' as ScreenId,
  moduleId: 'tax' as ModuleId,
  controller: (ctx) => useTaxRuleController(ctx.params['id'] as string),
  kind: 'setup',
  titleKey: 'Tax Rule',
  primaryView: 'rule',
  route: {
    path: 'rules/:id',
    name: 'finance.tax.rule',
  },
  permissions: [{ key: 'finance:tax:view' }],
  views: {
    rule: {
      name: 'rule',
      kind: 'single',
      containerName: 'TaxRuleRecord',
      queryKey: ['tax', 'rules', 'detail'] as const,
    },
  },
  layout: {
    summaryTemplate: '17-17-14',
    renderTarget: () => import('./view.vue') as never,
    sidePanel: { tabs: [], defaultCollapsed: true },
  },
  commands: [],
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: false,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'TX202000',
    viewNames: [],
    actionNames: [],
  },
}
