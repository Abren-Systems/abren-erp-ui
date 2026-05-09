import type { ScreenDefinition } from '@/platform/screen-runtime'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'
import { useWarehousesListController } from './controller'

export const IN2040PL: ScreenDefinition = {
  id: createScreenId('IN2040PL'),
  moduleId: 'inventory' as ModuleId,
  controller: () => useWarehousesListController(),
  kind: 'primaryList',
  titleKey: 'Warehouses',
  primaryView: 'warehouses',
  route: {
    path: 'warehouses',
    name: 'inventory.warehouses',
  },
  permissions: [{ key: 'inventory:view' }],
  views: {
    warehouses: {
      name: 'warehouses',
      kind: 'collection',
      containerName: 'WarehousesList',
      queryKey: ['inventory', 'warehouses'] as const,
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
    containerName: 'IN2040PL',
    viewNames: [],
    actionNames: [],
  },
}
