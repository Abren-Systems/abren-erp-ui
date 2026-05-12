<script setup lang="ts">
import { AppButton, AppSelect } from '@/shared/components/primitives'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import type { Table } from '@tanstack/vue-table'

import { computed } from 'vue'

const props = defineProps<{
  table: Table<unknown>
}>()

const selectedCount = computed(() => Object.keys(props.table.getState().rowSelection).length)

const pageSizeOptions = [
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '500', value: 500 },
]
</script>

<template>
  <div class="pagination-controls">
    <!-- Selection Status -->
    <div class="flex items-center w-[150px]">
      <span v-if="selectedCount > 0" class="text-xs font-semibold text-[var(--color-primary-600)]">
        {{ selectedCount }} selected
      </span>
    </div>

    <!-- Page Size -->
    <div class="flex items-center gap-2">
      <span class="text-xs text-[var(--color-neutral-500)]">Rows per page</span>
      <AppSelect
        :model-value="props.table.getState().pagination.pageSize"
        @update:model-value="(val) => props.table.setPageSize(Number(val))"
        :options="pageSizeOptions"
        class="w-[70px]"
      />
    </div>

    <!-- Info -->
    <div
      class="flex items-center justify-center text-xs text-[var(--color-neutral-600)] font-medium w-[150px]"
    >
      Page {{ props.table.getState().pagination.pageIndex + 1 }} of
      {{ props.table.getPageCount() }}
    </div>

    <!-- Navigation -->
    <div class="flex items-center gap-1">
      <AppButton
        variant="stealth"
        class="h-7 w-7 p-0"
        @click="props.table.setPageIndex(0)"
        :disabled="!props.table.getCanPreviousPage()"
      >
        <ChevronsLeft :size="14" />
      </AppButton>
      <AppButton
        variant="stealth"
        class="h-7 w-7 p-0"
        @click="props.table.previousPage()"
        :disabled="!props.table.getCanPreviousPage()"
      >
        <ChevronLeft :size="14" />
      </AppButton>
      <AppButton
        variant="stealth"
        class="h-7 w-7 p-0"
        @click="props.table.nextPage()"
        :disabled="!props.table.getCanNextPage()"
      >
        <ChevronRight :size="14" />
      </AppButton>
      <AppButton
        variant="stealth"
        class="h-7 w-7 p-0"
        @click="props.table.setPageIndex(props.table.getPageCount() - 1)"
        :disabled="!props.table.getCanNextPage()"
      >
        <ChevronsRight :size="14" />
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
</style>
