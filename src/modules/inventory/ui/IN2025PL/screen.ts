import { useStockItemsListController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'

export const IN2025PL: ScreenDefinition = {
  id: 'IN2025PL' as ScreenId,
  moduleId: 'inventory' as ModuleId,
  controller: () => useStockItemsListController(),
  kind: 'primaryList',
  titleKey: 'Stock Items',
  primaryView: 'stockItems',
  route: {
    path: 'stock',
    name: 'inventory.stock',
  },
  permissions: [{ key: 'inventory:view' }],
  views: {
    stockItems: {
      name: 'stockItems',
      kind: 'collection',
      containerName: 'StockItemsList',
      queryKey: ['inventory', 'stockItems'] as const,
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
    containerName: 'IN2025PL',
    viewNames: [],
    actionNames: [],
  },
}
