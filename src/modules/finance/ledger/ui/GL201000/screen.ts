import type { ModuleId } from '@/shared/types/brand.types'
import { useFiscalPeriodsController } from './controller'
import { GL201000_COMMANDS_LIST } from './commands'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ScreenDefinition } from '@/platform/screen-runtime'

/**
 * GL201000 - Master Financial Calendar
 */
export const GL201000: ScreenDefinition = {
  id: createScreenId('GL201000'),
  moduleId: 'ledger' as ModuleId,
  controller: () => useFiscalPeriodsController(),
  kind: 'maintenance',
  titleKey: 'Master Financial Calendar',
  primaryView: 'periods',
  route: {
    path: 'fiscal-calendar',
    name: 'LedgerFiscalCalendar',
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
  commands: GL201000_COMMANDS_LIST,
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
