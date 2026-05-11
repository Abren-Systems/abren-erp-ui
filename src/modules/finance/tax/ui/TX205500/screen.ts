import { useTaxGroupController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import { createScreenId } from '@/platform/screen-runtime'
import type { ModuleId } from '@/shared/types/brand.types'

export const TX205500: ScreenDefinition = {
  id: createScreenId('TX205500'),
  moduleId: 'tax' as ModuleId,
  controller: (ctx) => useTaxGroupController(ctx.params['id'] as string),
  kind: 'maintenance',
  titleKey: 'Tax Groups',
  primaryView: 'group',
  route: {
    path: 'tax-groups/:id',
    name: 'TaxGroupsDetail',
  },
  permissions: [{ key: 'finance:tax:view' }],
  views: {
    group: {
      name: 'group',
      kind: 'single',
      containerName: 'TaxGroupRecord',
      queryKey: ['tax', 'groups', 'detail'] as const,
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
    containerName: 'TX205500',
    viewNames: [],
    actionNames: [],
  },
}
