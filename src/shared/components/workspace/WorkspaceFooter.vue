<script setup lang="ts">
/**
 * WorkspaceFooter.vue
 *
 * DataGrid smart footer that satisfies the financial contract.
 */

defineProps<{
  totalRows: number
  selectedCount?: number
  totalAmountFormatted?: string
}>()
</script>

<template>
  <div
    class="flex justify-between items-center w-full px-4 text-[13px] font-medium text-[var(--color-neutral-600)] bg-[var(--color-neutral-50)] h-10 border-t border-[var(--color-neutral-200)]"
  >
    <div class="flex items-center gap-4">
      <span>Showing {{ totalRows }} rows</span>
      <span
        v-if="selectedCount && selectedCount > 0"
        class="text-[var(--color-primary-600)] font-semibold"
      >
        Selected: {{ selectedCount }}
      </span>
    </div>
    <div v-if="totalAmountFormatted" class="text-[var(--color-neutral-900)] tabular-nums">
      Total: {{ totalAmountFormatted }}
    </div>
  </div>
</template>
