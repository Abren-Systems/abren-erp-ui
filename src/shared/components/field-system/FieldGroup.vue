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
  gap: var(--ds-spacing-md);
  /* Default to inheriting the parent's column structure, or overriding it if props.columns is provided */
  grid-column: 1 / -1;
}
</style>
