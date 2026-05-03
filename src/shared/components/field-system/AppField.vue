<script setup lang="ts">
/**
 * AppField — The only way to display a data field in a business screen.
 *
 * Responsibility: receive value → ask registry → render. Nothing else.
 *
 * @see docs/FIELD_SYSTEM.md
 */
import { computed } from 'vue'
import { resolveField, type FieldType, type FieldContext } from './registry'

const props = withDefaults(
  defineProps<{
    /** Stable identity key (e.g., "totalAmount"). Used for schema, personalization, testing. */
    field: string
    /** Display label (e.g., "Total Amount"). UI concern only. */
    label: string
    /** Raw domain value. Must NOT be pre-formatted. */
    value: unknown
    /** Registry type key. */
    type: FieldType
    /** Optional rendering hints for domain-aware display. */
    context?: FieldContext
    /** Label/value density. */
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    context: undefined,
    size: 'md',
  },
)

const definition = computed(() => resolveField(props.type))

const isEmpty = computed(() => definition.value.empty(props.value))

const displayValue = computed(() => {
  if (isEmpty.value) return definition.value.emptyDisplay
  return definition.value.format(props.value, props.context)
})

const statusVariant = computed(() => {
  if (props.type !== 'status' || isEmpty.value) return undefined
  return definition.value.variant?.(props.value, props.context)
})
</script>

<template>
  <div
    :id="`field-${field}`"
    class="app-field"
    :class="[`app-field--${size}`, `app-field--align-${definition.align}`]"
  >
    <span class="app-field__label">{{ label }}</span>
    <span
      v-if="type === 'status' && !isEmpty"
      class="app-field__badge"
      :class="`app-field__badge--${statusVariant}`"
    >
      {{ displayValue }}
    </span>
    <span
      v-else
      class="app-field__value"
      :class="[`app-field__value--${definition.emphasis}`, { 'app-field__value--empty': isEmpty }]"
    >
      {{ displayValue }}
    </span>
  </div>
</template>

<style scoped>
.app-field {
  display: grid;
  /* Default to vertical stacking unless overridden by Fieldset */
  grid-template-columns: 1fr;
  row-gap: 2px;
  min-width: 0;
}

.app-field--sm {
  gap: 1px;
}
.app-field--sm .app-field__label {
  font-size: var(--text-micro);
}
.app-field--sm .app-field__value {
  font-size: var(--text-body-sm);
}

.app-field--md .app-field__label {
  font-size: var(--text-label);
}
.app-field--md .app-field__value {
  font-size: var(--text-body);
}

.app-field--lg .app-field__label {
  font-size: var(--text-label);
}
.app-field--lg .app-field__value {
  font-size: var(--text-lg);
}

.app-field__label {
  color: var(--color-neutral-500);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.2;
}

.app-field__value {
  color: var(--color-neutral-900);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-field__value--strong {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.app-field__value--muted {
  color: var(--color-neutral-400);
  font-family: var(--font-mono);
  font-size: var(--text-code);
}

.app-field__value--empty {
  color: var(--color-neutral-300);
}

.app-field--align-right .app-field__value {
  text-align: right;
}

/* --- Status Badge --- */
.app-field__badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: var(--text-body-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  width: fit-content;
}

.app-field__badge--success {
  background: var(--color-success-50);
  color: var(--color-success-700);
}
.app-field__badge--danger {
  background: var(--color-danger-50);
  color: var(--color-danger-700);
}
.app-field__badge--warning {
  background: var(--color-warning-50);
  color: var(--color-warning-700);
}
.app-field__badge--info {
  background: var(--color-info-50);
  color: var(--color-info-700);
}
.app-field__badge--neutral {
  background: var(--color-neutral-100);
  color: var(--color-neutral-600);
}
</style>
