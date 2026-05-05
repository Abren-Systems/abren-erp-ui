import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'

export const TX2010PL: ScreenDefinition = {
  id: 'TX2010PL' as ScreenId,
  moduleId: 'tax' as ModuleId,
  kind: 'inquiry',
  titleKey: 'Tax Groups',
  primaryView: 'groups',
  route: {
    path: 'groups',
    name: 'finance.tax.groups',
  },
  permissions: [{ key: 'finance:tax:view' }],
  views: {
    groups: {
      name: 'groups',
      kind: 'collection',
      containerName: 'TaxGroupsList',
      queryKey: ['tax', 'groups'] as const,
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
    containerName: 'TX2010PL',
    viewNames: [],
    actionNames: [],
  },
}
