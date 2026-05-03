<script setup lang="ts">
/**
 * AppFieldset — The only way to group fields in a business screen.
 *
 * Layout constraints:
 * - Maximum 3 columns (hard limit).
 * - No nested grids — use <FieldGroup> for sub-grouping.
 * - Internal spacing uses design tokens exclusively.
 *
 * @see docs/FIELD_SYSTEM.md
 */
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Section heading. Optional for ghost fieldsets used for layout. */
    title?: string
    /** Color-coded header variant. Ghost variant removes borders. */
    variant?: 'primary' | 'neutral' | 'accent' | 'ghost'
    /** Grid columns for child fields. Maximum 3. */
    columns?: 1 | 2 | 3
    /** Enables expand/collapse. */
    collapsible?: boolean
    /** Layout direction. Horizontal mimics Acumatica's summary fields. */
    layout?: 'vertical' | 'horizontal'
  }>(),
  {
    title: undefined,
    variant: 'neutral',
    columns: 2,
    collapsible: false,
    layout: 'vertical',
  },
)

const isExpanded = ref(true)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
}))

function toggleCollapse() {
  if (props.collapsible) {
    isExpanded.value = !isExpanded.value
  }
}
</script>

<template>
  <section
    class="app-fieldset"
    :class="[`app-fieldset--${variant}`, `app-fieldset--layout-${layout}`]"
  >
    <header
      v-if="title || collapsible"
      class="app-fieldset__header"
      :class="{ 'app-fieldset__header--clickable': collapsible }"
      @click="toggleCollapse"
    >
      <h3 class="app-fieldset__title">{{ title }}</h3>
      <span
        v-if="collapsible"
        class="app-fieldset__chevron"
        :class="{ 'app-fieldset__chevron--collapsed': !isExpanded }"
      >
        ▾
      </span>
    </header>
    <div v-show="isExpanded" class="app-fieldset__body" :style="gridStyle">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.app-fieldset {
  background: var(--color-white);
  border: 1px solid var(--app-border);
  border-radius: var(--ds-radius-lg);
  overflow: hidden;
  box-shadow: var(--ds-shadow-sm);
  display: flex;
  flex-direction: column;
}

.app-fieldset__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ds-spacing-md) var(--ds-spacing-lg);
  background: var(--color-neutral-50);
  border-bottom: 1px solid var(--app-border);
  transition: background-color 150ms ease;
}

.app-fieldset__header--clickable {
  cursor: pointer;
  user-select: none;
}

.app-fieldset__header--clickable:hover {
  background: var(--color-neutral-100);
}

.app-fieldset__title {
  font-size: var(--text-body-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-neutral-900);
  margin: 0;
}

.app-fieldset__chevron {
  color: var(--color-neutral-400);
  transition: transform 200ms ease;
  font-size: 1.2rem;
  line-height: 1;
}

.app-fieldset__chevron--collapsed {
  transform: rotate(-90deg);
}

.app-fieldset__body {
  padding: var(--ds-spacing-lg);
  display: grid;
  gap: var(--ds-spacing-xl);
  align-items: start;
}

/* --- Layout Engine --- */
.app-fieldset--layout-horizontal {
  --app-field-label-width: 140px; /* ERP Baseline */
}

.app-fieldset--layout-horizontal :deep(.app-field) {
  /* Enforce Acumatica-style label/value alignment */
  grid-template-columns: var(--app-field-label-width) 1fr;
  column-gap: var(--ds-spacing-sm, 12px);
  row-gap: 0;
  align-items: baseline;
}

.app-fieldset--layout-horizontal :deep(.app-field__label) {
  text-align: left;
  white-space: normal;
}

/* --- Variants --- */
.app-fieldset--ghost {
  border: none;
  box-shadow: none;
  background: transparent;
}

.app-fieldset--ghost .app-fieldset__header {
  padding: 0 0 var(--ds-spacing-md) 0;
  border-bottom: 2px solid var(--color-neutral-200); /* Thin line under header like Acumatica */
  margin-bottom: var(--ds-spacing-md);
  background: transparent;
}

.app-fieldset--ghost .app-fieldset__body {
  padding: 0;
}

.app-fieldset--neutral .app-fieldset__header {
  background: var(--color-neutral-50);
  color: var(--color-neutral-700);
  border-bottom: 1px solid var(--app-border);
}

.app-fieldset--primary .app-fieldset__header {
  background: var(--color-primary-50);
  color: var(--color-primary-800);
  border-bottom: 1px solid var(--color-primary-200);
}

.app-fieldset--accent .app-fieldset__header {
  background: var(--color-info-50);
  color: var(--color-info-700);
  border-bottom: 1px solid var(--color-info-100);
}
</style>
