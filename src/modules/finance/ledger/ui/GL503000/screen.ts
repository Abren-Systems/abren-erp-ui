import type { ModuleId } from '@/shared/types/brand.types'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import { useManagePeriodsController } from './controller'

/**
 * GL503000: Manage Financial Periods
 *
 * Process screen for bulk lifecycle operations (Close, Open, Lock).
 */
export const GL503000: ScreenDefinition = {
  id: createScreenId('GL503000'),
  moduleId: 'ledger' as ModuleId,
  controller: () => useManagePeriodsController(),
  kind: 'processing',
  titleKey: 'Manage Financial Periods',
  primaryView: 'periods',
  route: {
    path: 'manage-periods',
    name: 'LedgerManagePeriods',
  },
  permissions: [{ key: 'ledger:manage_fiscal_periods', description: 'Manage fiscal periods' }],
  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue') as never,
  },
  views: {
    periods: {
      name: 'periods',
      kind: 'collection',
      containerName: 'FiscalPeriods',
      queryKey: ['finance', 'ledger', 'fiscal-periods'] as const,
    },
  },
  commands: [], // Commands are registered in the controller
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'ManagePeriodsScreen',
    viewNames: ['PeriodsGrid'],
    actionNames: ['Process'],
  },
}
