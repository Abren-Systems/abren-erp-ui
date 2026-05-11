import { useTaxGroupsListController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import { createScreenId } from '@/platform/screen-runtime'
import type { ModuleId } from '@/shared/types/brand.types'
import { TX2055PL_COMMANDS } from './commands'

export const TX2055PL: ScreenDefinition = {
  id: createScreenId('TX2055PL'),
  moduleId: 'tax' as ModuleId,
  controller: () => useTaxGroupsListController(),
  kind: 'primaryList',
  titleKey: 'Tax Groups',
  primaryView: 'groups',
  route: {
    path: 'tax-groups',
    name: 'TaxGroupsList',
  },
  permissions: [{ key: 'finance:tax:view' }],
  views: {
    groups: {
      name: 'groups',
      kind: 'collection',
      containerName: 'TaxGroupsList',
      queryKey: ['tax', 'groups'] as const,
    },
  },
  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue') as never,
    sidePanel: { tabs: [], defaultCollapsed: true },
  },
  commands: Object.values(TX2055PL_COMMANDS),
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'TX2055PL',
    viewNames: [],
    actionNames: [],
  },
}
