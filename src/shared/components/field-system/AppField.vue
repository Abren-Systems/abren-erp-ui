<script setup lang="ts">
/**
 * AppField — The only way to display a data field in a business screen.
 *
 * Phase 1: receive value → ask registry → render formatted text.
 * Phase 2: in edit mode, delegate to registry-defined bare editor.
 *
 * AppField is a ROUTER, not a logic container. It never branches on type.
 * Read mode uses `value`. Edit mode uses `modelValue`. Never both.
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
    /** Raw domain value for read mode. Must NOT be pre-formatted. */
    value?: unknown
    /** Registry type key. */
    type: FieldType
    /** Optional rendering hints for domain-aware display. */
    context?: FieldContext
    /** Label/value density. */
    size?: 'sm' | 'md' | 'lg'
    /** Render mode. Read = formatted text. Edit = registry editor. */
    mode?: 'read' | 'edit'
    /** Bound value for edit mode (v-model). Mutually exclusive with `value`. */
    modelValue?: unknown
    /** Error string for edit mode. Passed through to the editor. */
    error?: string
    /** Disables the editor in edit mode. */
    disabled?: boolean
    /** Makes the editor read-only in edit mode. */
    readonly?: boolean
    /** Runtime props forwarded to the editor (e.g., select options). Merges with registry editorProps. */
    editorAttrs?: Record<string, unknown>
  }>(),
  {
    value: undefined,
    context: undefined,
    size: 'md',
    mode: 'read',
    modelValue: undefined,
    error: '',
    disabled: false,
    readonly: false,
    editorAttrs: undefined,
  },
)

defineEmits<{
  (e: 'update:modelValue', value: unknown): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}>()

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

/** Merge static registry defaults with runtime screen-level overrides. Screen wins on conflict. */
const mergedEditorProps = computed(() => ({
  ...definition.value.editorProps?.(),
  ...props.editorAttrs,
}))
</script>

<template>
  <div
    :id="`field-${field}`"
    class="app-field"
    :class="[`app-field--${size}`, `app-field--align-${definition.align}`]"
  >
    <span class="app-field__label">{{ label }}</span>

    <!-- EDIT: delegate to registry-defined bare editor -->
    <div v-if="mode === 'edit' && definition.editor" class="app-field__control">
      <component
        :is="definition.editor"
        :model-value="modelValue"
        :error="error"
        :disabled="disabled"
        :readonly="readonly"
        v-bind="mergedEditorProps"
        @update:model-value="$emit('update:modelValue', $event)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
    </div>

    <!-- READ: status badge -->
    <span
      v-else-if="type === 'status' && !isEmpty"
      class="app-field__badge"
      :class="`app-field__badge--${statusVariant}`"
    >
      {{ displayValue }}
    </span>

    <!-- READ: formatted value -->
    <span
      v-else
      class="app-field__value"
      :class="[`app-field__value--${definition.emphasis}`, { 'app-field__value--empty': isEmpty }]"
    >
      {{ displayValue }}
    </span>
  </div>
</template>
