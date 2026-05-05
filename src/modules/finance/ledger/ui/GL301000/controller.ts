import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useJournalEntry } from '../../application/useJournalEntry'
import { GL301000 } from './screen'
import { GL301000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings'

export function useJournalEntryController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')

  // ── Data Sources ──
  const { entry, isLoading, postEntry, voidEntry } = useJournalEntry(id)

  // ── Platform Base ──
  const base = useScreenController({
    screen: GL301000,
    dataSource: { entity: entry, isLoading, error: ref(null) },
    isNew,
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
  const currentLines = computed(() => entry.value?.lines || [])
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
