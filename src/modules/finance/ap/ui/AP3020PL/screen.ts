import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ModuleId } from '@/shared/types/brand.types'
import { useVendorBillsListController } from './controller'
import { AP3020PL_COMMANDS_LIST } from './commands'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

export const AP3020PL: ScreenDefinition = {
  id: createScreenId('AP3020PL'),
  moduleId: 'ap' as ModuleId,
  controller: () => useVendorBillsListController(),
  kind: 'primaryList',
  titleKey: 'Vendor Bills',
  primaryView: 'bills',
  route: {
    path: 'vendor-bills',
    name: 'VendorBillsList',
  },
  permissions: [{ key: 'ap:view' }],
  views: {
    bills: {
      name: 'bills',
      kind: 'collection',
      containerName: 'VendorBillsList',
      queryKey: ['ap', 'vendor-bills', 'list'] as const,
    },
  },
  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue') as never,
    sidePanel: {
      tabs: [],
      defaultCollapsed: true,
    },
  },
  commands: AP3020PL_COMMANDS_LIST,
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'AP3020PL',
    viewNames: [],
    actionNames: [],
  },
}
