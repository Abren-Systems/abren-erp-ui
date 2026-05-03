<script setup lang="ts">
/**
 * DataGridFooter.vue
 *
 * Grid-owned footer that displays row counts, selection state, and monetary totals.
 * This is a Grid concern — it reads Grid data, not Workspace data.
 */

defineProps<{
  totalRows: number
  selectedCount?: number
  totalAmountFormatted?: string
}>()
</script>

<template>
  <div class="grid-footer">
    <div class="footer-left">
      <span class="footer-metric">{{ totalRows }} records</span>
      <span v-if="selectedCount && selectedCount > 0" class="footer-selection">
        {{ selectedCount }} selected
      </span>
    </div>
    <div v-if="totalAmountFormatted" class="footer-total">
      {{ totalAmountFormatted }}
    </div>
  </div>
</template>

<style scoped>
.grid-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 32px;
  padding: 0 12px;
  background: var(--color-neutral-50);
  border-top: 1px solid var(--color-neutral-200);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-neutral-500);
  flex-shrink: 0;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-selection {
  color: var(--color-primary-600);
  font-weight: 700;
}

.footer-total {
  color: var(--color-neutral-900);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
</style>
