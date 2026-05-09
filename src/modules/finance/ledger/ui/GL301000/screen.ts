import { useJournalEntryController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import { createScreenId } from '@/platform/screen-runtime'
import { GL301000_COMMANDS } from './commands'
import type { ModuleId } from '@/shared/types/brand.types'

export const GL301000: ScreenDefinition = {
  id: createScreenId('GL301000'),
  moduleId: 'ledger' as ModuleId,
  controller: (ctx) => useJournalEntryController(ctx.params['id'] as string),
  kind: 'dataEntry',
  titleKey: 'Journal Entries',
  primaryView: 'journalEntry',
  route: {
    path: 'journal-entries/:id',
    name: 'LedgerJournalDetail',
  },
  permissions: [{ key: 'ledger:view_entry' }],
  views: {
    journalEntry: {
      name: 'journalEntry',
      kind: 'single',
      containerName: 'JournalEntryRecord',
      queryKey: ['ledger', 'journal-entries', 'detail'] as const,
    },
    lines: {
      name: 'lines',
      kind: 'collection',
      containerName: 'JournalEntryLines',
      queryKey: ['ledger', 'journal-entries', 'lines'] as const,
    },
  },
  layout: {
    summaryTemplate: '1-1-1',
    renderTarget: () => import('./view.vue') as never,
    sidePanel: {
      tabs: [], // Trace panel removed for now
      defaultCollapsed: true,
    },
  },
  commands: GL301000_COMMANDS,
  personalization: {
    allowTabPersonalization: true,
    allowGridPersonalization: true,
    allowFilterSaving: false,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'GL301000',
    viewNames: [],
    actionNames: [],
  },
}
