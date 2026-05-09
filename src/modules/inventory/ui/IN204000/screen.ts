import type { ScreenDefinition } from '@/platform/screen-runtime'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'
import { useWarehouseController } from './controller'

export const IN204000: ScreenDefinition = {
  id: createScreenId('IN204000'),
  moduleId: 'inventory' as ModuleId,
  controller: (ctx) => useWarehouseController(ctx.params['id'] as string),
  kind: 'setup',
  titleKey: 'Warehouse',
  primaryView: 'warehouse',
  route: {
    path: 'warehouses/:id',
    name: 'inventory.warehouse-detail',
  },
  permissions: [{ key: 'inventory:view' }],
  views: {
    warehouse: {
      name: 'warehouse',
      kind: 'single',
      containerName: 'WarehouseRecord',
      queryKey: ['inventory', 'warehouses', 'detail'] as const,
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
    containerName: 'IN204000',
    viewNames: [],
    actionNames: [],
  },
}
