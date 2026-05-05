import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'

export const IN303000: ScreenDefinition = {
  id: 'IN303000' as ScreenId,
  moduleId: 'inventory' as ModuleId,
  kind: 'dataEntry',
  titleKey: 'Post Inventory Adjustment',
  primaryView: 'adjustment',
  route: {
    path: 'adjustments/:id',
    name: 'inventory.adjustment-detail',
  },
  permissions: [{ key: 'inventory:write' }],
  views: {
    adjustment: {
      name: 'adjustment',
      kind: 'single',
      containerName: 'AdjustmentRecord',
      queryKey: ['inventory', 'adjustments', 'detail'] as const,
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
    containerName: 'IN303000',
    viewNames: [],
    actionNames: [],
  },
}
