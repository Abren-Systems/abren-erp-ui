import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ModuleId } from '@/shared/types/brand.types'
import { useVendorsListController } from './controller'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

import type { VendorDTO } from '../../infrastructure/api.types'

export const AP3030PL: ScreenDefinition<VendorDTO[], string> = {
  id: createScreenId('AP3030PL'),
  moduleId: 'ap' as ModuleId,
  controller: () => useVendorsListController(),
  kind: 'primaryList',
  titleKey: 'Vendors',
  primaryView: 'vendors',
  route: {
    path: 'vendors',
    name: 'VendorList',
  },
  permissions: [{ key: 'ap:view' }],
  views: {
    vendors: {
      name: 'vendors',
      kind: 'collection',
      containerName: 'VendorList',
      queryKey: ['ap', 'vendors', 'list'] as const,
    },
  },
  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue') as never,
  },
  commands: [],
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'AP3030PL',
    viewNames: ['vendors'],
    actionNames: ['new_vendor'],
  },
}
