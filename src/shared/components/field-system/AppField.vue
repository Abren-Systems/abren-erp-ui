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
import { resolveField, type FieldContext } from './registry'
import type { PrimitiveType } from '@/platform/component-contracts'
import { SemanticKind } from '@/platform/semantic-runtime/contracts'
import { resolveSemantic } from '@/platform/semantic-runtime/registry'
import { renderingRuntime } from '@/platform/chrome/renderers/RenderingRuntime'
import { defineAsyncComponent } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Stable identity key (e.g., "totalAmount"). Used for schema, personalization, testing. */
    field: string
    /** Display label (e.g., "Total Amount"). UI concern only. */
    label: string
    /** Raw domain value for read mode. Must NOT be pre-formatted. */
    value?: unknown
    /** Primitive data type. */
    type: PrimitiveType
    /** Business semantic for meaning-driven rendering. */
    semantic?: SemanticKind
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
    /** Hides the entire field from the layout. */
    hidden?: boolean
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
    hidden: false,
  },
)

defineEmits<{
  (e: 'update:modelValue', value: unknown): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}>()

const definition = computed(() => resolveField(props.type))
const semanticRuntime = computed(() =>
  props.semantic ? resolveSemantic(props.semantic) : undefined,
)

const isEmpty = computed(() => definition.value.empty(props.value))

const displayValue = computed(() => {
  if (isEmpty.value) return definition.value.emptyDisplay
  // SMI-03: Semantic Runtime has formatting authority
  if (semanticRuntime.value?.formatter) {
    return semanticRuntime.value.formatter(props.value, { locale: 'en-US', tenantId: 'SYSTEM' })
  }
  return definition.value.format(props.value, props.context)
})

const statusVariant = computed(() => {
  if (props.semantic !== SemanticKind.Status || isEmpty.value) return undefined
  // Fallback variant logic
  return definition.value.variant?.(props.value, props.context)
})

const resolvedEditor = computed(() => {
  // Explicit override > Semantic > ControlType
  if (semanticRuntime.value?.editorRendererKey) {
    const loader = renderingRuntime.getLoader(semanticRuntime.value.editorRendererKey)
    if (loader) return defineAsyncComponent(loader)
  }
  return definition.value.editor
})

const resolvedDisplay = computed(() => {
  if (semanticRuntime.value?.displayRendererKey) {
    const loader = renderingRuntime.getLoader(semanticRuntime.value.displayRendererKey)
    if (loader) return defineAsyncComponent(loader)
  }
  return undefined
})

/** Merge static registry defaults with runtime screen-level overrides. Screen wins on conflict. */
const mergedEditorProps = computed(() => ({
  ...definition.value.editorProps?.(),
  ...props.editorAttrs,
}))
</script>

<template>
  <div
    v-if="!hidden"
    :id="`field-${field}`"
    class="app-field"
    :class="[`app-field--${size}`, `app-field--align-${definition.align}`]"
  >
    <span class="app-field__label">{{ label }}</span>

    <!-- EDIT: delegate to registry-defined bare editor -->
    <div v-if="mode === 'edit' && resolvedEditor" class="app-field__control">
      <component
        :is="resolvedEditor"
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

    <!-- READ: Semantic Display Renderer -->
    <component
      v-else-if="resolvedDisplay"
      :is="resolvedDisplay"
      :value="value"
      :display-value="displayValue"
      :is-empty="isEmpty"
      :variant="statusVariant"
    />

    <!-- READ: status badge (legacy fallback) -->
    <span
      v-else-if="semantic === SemanticKind.Status && !isEmpty"
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

<style scoped>
.app-field {
  display: grid;
  grid-template-columns: minmax(130px, 35%) 1fr;
  align-items: center;
  gap: 0.75rem;
  min-height: 2rem;
}

.app-field__label {
  font-size: 0.8125rem; /* ~13px */
  color: var(--color-neutral-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-field__control {
  min-width: 0; /* Prevent grid blowout from inputs */
  width: 100%;
}

.app-field__value {
  font-size: 0.875rem; /* 14px */
  color: var(--color-neutral-900);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-field__value--strong {
  font-weight: 600;
}

.app-field__value--empty {
  color: var(--color-neutral-400);
  font-style: italic;
  font-size: 0.8125rem;
}

/* Numeric variants */
.app-field--align-right .app-field__value,
.app-field--align-right .app-field__control {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* Status Badges */
.app-field__badge {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-700);
}

.app-field__badge--success {
  background-color: #dcfce7;
  color: #166534;
}
.app-field__badge--warning {
  background-color: #fef08a;
  color: #854d0e;
}
.app-field__badge--danger {
  background-color: #fee2e2;
  color: #991b1b;
}
.app-field__badge--info {
  background-color: #dbeafe;
  color: #1e40af;
}
</style>
