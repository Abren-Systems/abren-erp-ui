import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useJournalEntries } from '../../application/useJournalEntries'
import { GL3010PL } from './screen'

export function useJournalEntriesListController() {
  const router = useRouter()
  const { entries, isLoading, error, refresh } = useJournalEntries()

  // ── Platform Base ──
  const base = useScreenController({
    screen: GL3010PL,
    dataSource: { entity: computed(() => null), isLoading, error },
    isNew: computed(() => false),
  })

  function handleRowClick(row: { id: string }) {
    void router.push({ name: 'LedgerJournalDetail', params: { id: row.id } })
  }

  return {
    ...base,
    entries,
    refresh,
    handleRowClick,
  }
}
