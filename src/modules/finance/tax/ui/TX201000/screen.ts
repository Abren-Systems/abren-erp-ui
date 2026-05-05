import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'

export const TX201000: ScreenDefinition = {
  id: 'TX201000' as ScreenId,
  moduleId: 'tax' as ModuleId,
  kind: 'setup',
  titleKey: 'Tax Group',
  primaryView: 'group',
  route: {
    path: 'groups/:id',
    name: 'finance.tax.group',
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
    containerName: 'TX201000',
    viewNames: [],
    actionNames: [],
  },
}
