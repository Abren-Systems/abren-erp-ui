import { useFiscalPeriodsController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'
import { GL102000_COMMANDS_LIST } from './commands'

/**
 * GL102000 - Fiscal Periods
 */
export const GL102000: ScreenDefinition = {
  id: 'GL102000' as ScreenId,
  moduleId: 'ledger' as ModuleId,
  controller: () => useFiscalPeriodsController(),
  kind: 'maintenance',
  titleKey: 'Fiscal Periods',
  primaryView: 'periods',
  route: {
    path: '/finance/ledger/fiscal-periods',
    name: 'FiscalPeriods',
  },
  permissions: [{ key: 'finance.ledger.fiscalPeriods.view', description: 'View fiscal periods' }],
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
  commands: GL102000_COMMANDS_LIST,
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'FiscalPeriodsScreen',
    viewNames: ['PeriodsGrid'],
    actionNames: ['GeneratePeriods'],
  },
}
