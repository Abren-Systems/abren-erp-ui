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
