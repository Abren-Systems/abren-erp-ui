import { useLedgerSettingsController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ModuleId } from '@/shared/types/brand.types'
import { GL102000_COMMANDS } from './commands'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

/**
 * GL102000 - Ledger Preferences
 */
export const GL102000: ScreenDefinition = {
  id: createScreenId('GL102000'),
  moduleId: 'ledger' as ModuleId,
  controller: () => useLedgerSettingsController(),
  kind: 'setup',
  titleKey: 'GL Preferences',
  primaryView: 'preferences',
  route: {
    path: 'settings',
    name: 'LedgerSettings',
  },
  permissions: [{ key: 'finance.ledger.settings.view', description: 'View ledger settings' }],
  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue') as never,
  },
  views: {
    preferences: {
      name: 'preferences',
      kind: 'single',
      containerName: 'LedgerPreferences',
      queryKey: ['finance', 'ledger', 'settings'] as const,
    },
  },
  commands: GL102000_COMMANDS,
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: false,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'LedgerSettingsScreen',
    viewNames: ['SettingsForm'],
    actionNames: ['Save'],
  },
}
