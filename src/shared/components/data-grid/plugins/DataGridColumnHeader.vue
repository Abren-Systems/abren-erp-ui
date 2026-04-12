<script setup lang="ts">
import type { Column } from '@tanstack/vue-table'
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-vue-next'

const props = defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: Column<any, unknown>
  title: string
}>()

function toggle() {
  if (!props.column.getCanSort()) return
  props.column.toggleSorting(props.column.getIsSorted() === 'asc')
}
</script>

<template>
  <button
    v-if="column.getCanSort()"
    class="column-header-btn"
    :aria-sort="
      column.getIsSorted() === 'asc'
        ? 'ascending'
        : column.getIsSorted() === 'desc'
          ? 'descending'
          : 'none'
    "
    @click="toggle"
  >
    <span>{{ title }}</span>
    <ArrowUp v-if="column.getIsSorted() === 'asc'" :size="12" class="sort-icon active" />
    <ArrowDown v-else-if="column.getIsSorted() === 'desc'" :size="12" class="sort-icon active" />
    <ChevronsUpDown v-else :size="12" class="sort-icon muted" />
  </button>
  <span v-else class="column-header-plain">{{ title }}</span>
</template>

<style scoped>
.column-header-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-grid-header-text);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color 0.12s ease;
  white-space: nowrap;
}

.column-header-btn:hover {
  color: var(--color-grid-text);
}

.column-header-plain {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-grid-header-text);
  white-space: nowrap;
}

.sort-icon.active {
  color: var(--color-primary-400);
}
.sort-icon.muted {
  opacity: 0.4;
}
</style>
