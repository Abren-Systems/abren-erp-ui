import { ref, onMounted } from 'vue'
import { ledgerAdapter } from '../../infrastructure/ledger_adapter'
import type { components } from '@/shared/api/generated.types'

type JournalEntryRead = components['schemas']['JournalEntryRead']

/**
 * Composable for managing Journal Entries.
 */
export function useJournalEntries() {
  const entries = ref<JournalEntryRead[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchEntries = async () => {
    isLoading.value = true
    error.value = null
    try {
      entries.value = await ledgerAdapter.getJournalEntries()
    } catch (err) {
      error.value = 'Failed to load journal entries'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const postEntry = async (entryId: string) => {
    isLoading.value = true
    try {
      await ledgerAdapter.postJournalEntry(entryId)
      await fetchEntries() // Refresh list
    } catch (err) {
      error.value = 'Failed to post entry'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    void fetchEntries()
  })

  return {
    entries,
    isLoading,
    error,
    fetchEntries,
    postEntry,
  }
}
