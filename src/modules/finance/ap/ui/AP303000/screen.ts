import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ModuleId } from '@/shared/types/brand.types'
import { useVendorProfileController } from './controller'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { VendorDTO } from '../../infrastructure/api.types'

export const AP303000: ScreenDefinition<VendorDTO, string> = {
  id: createScreenId('AP303000'),
  moduleId: 'ap' as ModuleId,
  controller: (ctx) => useVendorProfileController(ctx.params['id'] as string) as never,
  kind: 'maintenance',
  titleKey: 'Vendor Profile',
  primaryView: 'profile',
  route: {
    path: 'vendors/:id',
    name: 'VendorDetail',
  },
  permissions: [{ key: 'ap:view' }],
  views: {
    profile: {
      name: 'profile',
      kind: 'single',
      containerName: 'VendorRecord',
      queryKey: ['ap', 'vendors', 'detail'] as const,
    },
  },
  layout: {
    summaryTemplate: '17-17-14',
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
    containerName: 'AP303000',
    viewNames: ['profile'],
    actionNames: ['save'],
  },
}
