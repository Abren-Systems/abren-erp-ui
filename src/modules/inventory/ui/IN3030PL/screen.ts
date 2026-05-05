import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'

export const IN3030PL: ScreenDefinition = {
  id: 'IN3030PL' as ScreenId,
  moduleId: 'inventory' as ModuleId,
  kind: 'inquiry',
  titleKey: 'Adjustments',
  primaryView: 'adjustments',
  route: {
    path: 'adjustments',
    name: 'inventory.adjustments',
  },
  permissions: [{ key: 'inventory:view' }],
  views: {
    adjustments: {
      name: 'adjustments',
      kind: 'collection',
      containerName: 'AdjustmentsList',
      queryKey: ['inventory', 'adjustments'] as const,
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
    containerName: 'IN3030PL',
    viewNames: [],
    actionNames: [],
  },
}
