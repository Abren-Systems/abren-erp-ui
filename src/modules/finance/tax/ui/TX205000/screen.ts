import { useTaxRuleController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import { createScreenId } from '@/platform/screen-runtime'
import type { ModuleId } from '@/shared/types/brand.types'

export const TX205000: ScreenDefinition = {
  id: createScreenId('TX205000'),
  moduleId: 'tax' as ModuleId,
  controller: (ctx) => useTaxRuleController(ctx.params['id'] as string),
  kind: 'maintenance',
  titleKey: 'Taxes',
  primaryView: 'rule',
  route: {
    path: 'taxes/:id',
    name: 'TaxesDetail',
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
    containerName: 'TX205000',
    viewNames: [],
    actionNames: [],
  },
}
