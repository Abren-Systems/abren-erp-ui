import { useFinancialYearController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ModuleId } from '@/shared/types/brand.types'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

/**
 * GL101000 - Financial Year
 *
 * Setup screen for generating new financial years.
 */
export const GL101000: ScreenDefinition = {
  id: createScreenId('GL101000'),
  moduleId: 'ledger' as ModuleId,
  controller: () => useFinancialYearController(),
  kind: 'setup',
  titleKey: 'Financial Year',
  primaryView: 'setup',
  route: {
    path: 'financial-year',
    name: 'LedgerFinancialYear',
  },
  permissions: [{ key: 'ledger:manage_fiscal_years', description: 'Manage fiscal years' }],
  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue') as never,
  },
  views: {
    setup: {
      name: 'setup',
      kind: 'single',
      containerName: 'FinancialYearSetup',
      queryKey: ['finance', 'ledger', 'fiscal-years'] as const,
    },
  },
  commands: [], // Commands registered in controller
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: false,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'FinancialYearScreen',
    viewNames: ['GenerationForm'],
    actionNames: ['Generate'],
  },
}
