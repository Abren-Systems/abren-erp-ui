import type { ModuleId } from '@/shared/types/brand.types'
import { useFiscalPeriodsController } from './controller'
import { GL102000_COMMANDS_LIST } from './commands'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ScreenDefinition } from '@/platform/screen-runtime'

/**
 * GL102000 - Fiscal Periods
 */
export const GL102000: ScreenDefinition = {
  id: createScreenId('GL102000'),
  moduleId: 'ledger' as ModuleId,
  controller: () => useFiscalPeriodsController(),
  kind: 'maintenance',
  titleKey: 'Fiscal Periods',
  primaryView: 'periods',
  route: {
    path: 'fiscal-periods',
    name: 'LedgerFiscalPeriods',
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
