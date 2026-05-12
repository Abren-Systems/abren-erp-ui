import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import type { JournalEntry } from '../../models/journal-entry.types'
import { useJournalEntry } from '../../application/useJournalEntry'
import { GL301000 } from './screen'
import { GL301000_FIELDS } from './fields'
import { GL301000_POLICY, type JournalEntryStatus } from './policy'
import { useField } from '@/platform/field-system/bindings'
import type { JournalEntryId } from '@/shared/types/brand.types'

export function useJournalEntryController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')
  const journalEntryId = id as JournalEntryId

  // ── Data Sources ──
  const { journalEntry, isLoading, postEntry, voidEntry } = useJournalEntry(journalEntryId)

  // ── Platform Base ──
  const base = useScreenController<JournalEntry, JournalEntryStatus>({
    screen: GL301000,
    dataSource: {
      entity: computed(() => journalEntry.value),
      operations: computed(() => journalEntry.value?.__operations),
      isLoading,
      error: ref(null),
    },
    isNew,
    getDomainState: (entity) => entity.status,
    statePolicy: GL301000_POLICY,
  })

  // ── Command Executors ──
  base.registerCommand('post', {
    execute: async () => void postEntry(),
    isPending: computed(() => false), // Add actual pending state if available from useJournalEntry
  })

  base.registerCommand('void', {
    execute: async () => void voidEntry({ reason: 'Voided via Data Entry screen' }),
    isPending: computed(() => false),
  })

  // ── Grid Data ──
  const currentLines = computed(() => journalEntry.value?.lines || [])
  const activeTab = ref('Journal Lines')

  // ── Field Bindings ──
  const fields = {
    entryNumber: useField(base, GL301000_FIELDS.entryNumber),
    status: useField(base, GL301000_FIELDS.status),
    entryDate: useField(base, GL301000_FIELDS.entryDate),
    description: useField(base, GL301000_FIELDS.description),
  }

  return {
    ...base,
    fields,
    currentLines,
    activeTab,
    router,
  }
}
