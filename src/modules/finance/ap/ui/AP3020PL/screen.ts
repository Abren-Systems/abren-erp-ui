import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'
import { AP3020PL_COMMANDS_LIST } from './commands'

export const AP3020PL: ScreenDefinition = {
  id: 'AP3020PL' as ScreenId,
  moduleId: 'ap' as ModuleId,
  kind: 'inquiry',
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
