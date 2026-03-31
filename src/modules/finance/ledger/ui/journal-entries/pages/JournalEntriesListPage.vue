<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { useJournalEntries } from '../../../application/composables/useJournalEntries'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import type { components } from '@/shared/api/generated.types'

const { entries, isLoading, postEntry } = useJournalEntries()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

type JournalEntryRead = components['schemas']['JournalEntryRead']
const columns: ColumnDef<JournalEntryRead>[] = [
  { accessorKey: 'entry_number', header: 'Entry #' },
  { accessorKey: 'date', header: 'Date' },
  { accessorKey: 'description', header: 'Description' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary'
      if (status === 'POSTED') variant = 'default'
      if (status === 'VOIDED') variant = 'destructive'
      if (status === 'DRAFT') variant = 'outline'
      return h(Badge, { variant }, () => status)
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const entry = row.original
      if (entry.status !== 'DRAFT') return null
      return h(
        Button,
        {
          size: 'sm',
          variant: 'outline',
          onClick: () => postEntry(entry.id),
        },
        () => 'Post',
      )
    },
  },
]
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px; height: 100%">
    <div style="display: flex; justify-content: space-between; align-items: center">
      <h1 style="font-size: 22px; font-weight: 700; color: var(--color-grid-text); margin: 0">
        Journal Entries
      </h1>
      <Button variant="default">New Entry</Button>
    </div>

    <div style="flex: 1; min-height: 0">
      <DataGrid
        :columns="columns"
        :data="entries"
        :loading="isLoading"
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        placeholder="Search entries…"
      />
    </div>
  </div>
</template>
