import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ModuleId } from '@/shared/types/brand.types'
import { useVendorBillController } from './controller'
import { AP302000_COMMANDS } from './commands'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

export const AP302000: ScreenDefinition = {
  id: createScreenId('AP302000'),
  moduleId: 'ap' as ModuleId,
  controller: (ctx) => useVendorBillController(ctx.params['id'] as string),
  kind: 'dataEntry',
  titleKey: 'Vendor Bills',
  primaryView: 'bill',
  route: {
    path: 'vendor-bills/:id',
    name: 'VendorBillDetail',
  },
  permissions: [{ key: 'ap:view' }],
  views: {
    bill: {
      name: 'bill',
      kind: 'single',
      containerName: 'VendorBillRecord',
      queryKey: ['ap', 'vendor-bills', 'detail'] as const,
    },
    lines: {
      name: 'lines',
      kind: 'collection',
      containerName: 'VendorBillLines',
      queryKey: ['ap', 'vendor-bills', 'lines'] as const,
    },
  },
  layout: {
    summaryTemplate: '17-17-14',
    renderTarget: () => import('./view.vue') as never,
    sidePanel: {
      tabs: [],
      defaultCollapsed: true,
    },
  },
  commands: AP302000_COMMANDS,
  personalization: {
    allowTabPersonalization: true,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'AP302000',
    viewNames: [],
    actionNames: [],
  },
}
