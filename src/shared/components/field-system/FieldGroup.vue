<script setup lang="ts">
/**
 * FieldGroup — Lightweight sub-grouping within an AppFieldset.
 *
 * Prevents overloading AppFieldset with nested layout concerns.
 *
 * @see docs/FIELD_SYSTEM.md
 */
import { computed } from 'vue'

const props = defineProps<{
  /** Grid columns for this group. Defaults to parent fieldset's value if not specified. */
  columns?: 1 | 2 | 3
}>()

const gridStyle = computed(() => {
  if (!props.columns) return {}
  return { gridTemplateColumns: `repeat(${props.columns}, 1fr)` }
})
</script>

<template>
  <div class="field-group" :style="gridStyle">
    <slot />
  </div>
</template>

<style scoped>
.field-group {
  display: grid;
  gap: 0.25rem 1.5rem; /* Tight vertical gap, wider horizontal gap if multi-column */
  grid-column: 1 / -1;
  background-color: var(--app-surface, #ffffff);
  border: 1px solid var(--color-neutral-200, #e5e7eb);
  border-radius: 0.375rem; /* rounded-md */
  padding: 1rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* subtle surface shadow */
}
</style>
