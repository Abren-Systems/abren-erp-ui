import { useStockItemController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'

export const IN202500: ScreenDefinition = {
  id: 'IN202500' as ScreenId,
  moduleId: 'inventory' as ModuleId,
  controller: (ctx) => useStockItemController(ctx.params['id'] as string),
  kind: 'setup',
  titleKey: 'Stock Item Position',
  primaryView: 'stockItem',
  route: {
    path: 'stock/:id',
    name: 'inventory.stock-detail',
  },
  permissions: [{ key: 'inventory:view' }],
  views: {
    stockItem: {
      name: 'stockItem',
      kind: 'single',
      containerName: 'StockItemRecord',
      queryKey: ['inventory', 'stockItems', 'detail'] as const,
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
    containerName: 'IN202500',
    viewNames: [],
    actionNames: [],
  },
}
