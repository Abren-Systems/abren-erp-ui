import { useJournalEntriesListController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import { GL3010PL_COMMANDS } from './commands'
import type { ModuleId } from '@/shared/types/brand.types'

export const GL3010PL: ScreenDefinition = {
  id: 'GL3010PL' as ScreenId,
  moduleId: 'ledger' as ModuleId,
  controller: () => useJournalEntriesListController(),
  kind: 'primaryList',
  titleKey: 'Journal Entries List',
  primaryView: 'journalEntries',
  route: {
    path: 'journal-entries',
    name: 'LedgerJournals',
  },
  permissions: [{ key: 'ledger:view_entry' }],
  views: {
    journalEntries: {
      name: 'journalEntries',
      kind: 'collection',
      containerName: 'JournalEntriesList',
      queryKey: ['ledger', 'journal-entries', 'list'] as const,
    },
  },
  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue') as never,
    sidePanel: {
      tabs: [],
      defaultCollapsed: true,
    },
  },
  commands: GL3010PL_COMMANDS,
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'GL3010PL',
    viewNames: [],
    actionNames: [],
  },
}
