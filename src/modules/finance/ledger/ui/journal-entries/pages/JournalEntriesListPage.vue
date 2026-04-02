<script setup lang="ts">
import { useJournalEntries } from '../../../application/composables/useJournalEntries'
import { DataGrid } from '@/shared/components/data-grid'
import { journalEntryColumns } from '../grids/journal-entry.grid'
import { Button } from '@/shared/components/button'
import { Plus, RefreshCcw } from 'lucide-vue-next'

const { entries, isLoading, refresh, postEntry } = useJournalEntries()

const handlePost = async (id: string) => {
  if (confirm('Are you sure you want to post this journal entry? It will become immutable.')) {
    await postEntry(id)
  }
}
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Journal Entries</h1>
        <p class="text-sm text-neutral-500">View and manage double-entry accounting records.</p>
      </div>
      <div class="flex items-center gap-3">
        <Button variant="outline" size="sm" @click="() => refresh()">
          <RefreshCcw :class="['w-4 h-4 mr-2', isLoading && 'animate-spin']" />
          Refresh
        </Button>
        <Button size="sm">
          <Plus class="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>
    </div>

    <DataGrid :columns="journalEntryColumns" :data="entries ?? []" :loading="isLoading" row-id="id">
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <Button
            v-if="row.status === 'DRAFT'"
            variant="outline"
            size="xs"
            @click="handlePost(row.id)"
          >
            Post
          </Button>
          <Button variant="ghost" size="xs"> View </Button>
        </div>
      </template>
    </DataGrid>
  </div>
</template>
