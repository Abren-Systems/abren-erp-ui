<script setup lang="ts">
/**
 * AppTemplate — CSS Grid engine for named layout templates.
 *
 * Maps Acumatica-style template names (e.g., '7-10-7') to CSS Grid
 * column definitions. Screens declare a template in their ScreenDefinition;
 * the renderer handles the grid math.
 *
 * Usage:
 *   <AppTemplate template="7-10-7">
 *     <FieldGroup>...</FieldGroup>
 *     <FieldGroup>...</FieldGroup>
 *     <FieldGroup>...</FieldGroup>
 *   </AppTemplate>
 */
import { computed } from 'vue'
import type { LayoutTemplate } from '../screen-runtime/screen-definition.types'

const props = withDefaults(
  defineProps<{
    /** Named template — maps to CSS Grid column definitions */
    template: LayoutTemplate
    /** Gap size between columns */
    gap?: 'sm' | 'md' | 'lg'
  }>(),
  { gap: 'md' },
)

const TEMPLATE_MAP: Record<LayoutTemplate, string> = {
  '1': '1fr',
  '1-1': '1fr 1fr',
  '1-1-1': '1fr 1fr 1fr',
  '2-1': '2fr 1fr',
  '1-2': '1fr 2fr',
  '7-10-7': '7fr 10fr 7fr',
  '17-17-14': '17fr 17fr 14fr',
  '17-14-17': '17fr 14fr 17fr',
  '14-17-17': '14fr 17fr 17fr',
  '17-7': '17fr 7fr',
  '7-17': '7fr 17fr',
  '17-31': '17fr 31fr',
}

const GAP_MAP: Record<string, string> = {
  sm: '0.75rem',
  md: '1.5rem',
  lg: '2.5rem',
}

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: TEMPLATE_MAP[props.template] ?? '1fr',
  gap: GAP_MAP[props.gap] ?? GAP_MAP.md,
}))
</script>

<template>
  <div :style="gridStyle" class="app-template">
    <slot />
  </div>
</template>

<style scoped>
.app-template {
  width: 100%;
  align-items: start;
}

/* Collapse to single column on narrow viewports */
@media (max-width: 768px) {
  .app-template {
    grid-template-columns: 1fr !important;
  }
}
</style>
