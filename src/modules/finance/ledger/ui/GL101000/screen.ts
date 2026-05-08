import { useLedgerSettingsController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'

import { GL101000_COMMANDS } from './commands'

/**
 * GL101000 - Ledger Preferences
 */
export const GL101000: ScreenDefinition = {
  id: 'GL101000' as ScreenId,
  moduleId: 'ledger' as ModuleId,
  controller: () => useLedgerSettingsController(),
  kind: 'setup',
  titleKey: 'Ledger Settings',
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
  commands: GL101000_COMMANDS,
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
