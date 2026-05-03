<script setup lang="ts">
/**
 * AppFormField — Bridge between TanStack Form and the Field System.
 *
 * This adapter maps a TanStack `FieldApi` to an `AppField`.
 * It perfectly translates the form state (value, errors, blur) into the
 * AppField contract without leaking form logic into the layout.
 *
 * @see docs/FIELD_SYSTEM.md — Phase 2.1
 */
import { computed } from 'vue'
import type { FieldApi } from '@tanstack/vue-form'
import AppField from './AppField.vue'
import type { FieldType, FieldContext } from './registry'

const props = withDefaults(
  defineProps<{
    /** TanStack Form Field instance */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: FieldApi<any, any, any, any>
    /** Display label */
    label: string
    /** Registry type key */
    type: FieldType
    /** Render mode. Defaults to 'edit' for form inputs. */
    mode?: 'read' | 'edit'
    /** Optional rendering hints for domain-aware display */
    context?: FieldContext
    /** Label/value density */
    size?: 'sm' | 'md' | 'lg'
    /** Runtime props forwarded to the editor (e.g., select options) */
    editorAttrs?: Record<string, unknown>
  }>(),
  {
    mode: 'edit',
    context: undefined,
    size: 'md',
    editorAttrs: undefined,
  },
)

const error = computed(() => {
  const errors = props.field.state.meta.errors
  return errors && errors.length > 0 ? String(errors[0]) : undefined
})

const isReadonly = computed(() => {
  // If the field is marked disabled in TanStack form state, we could pass it here,
  // but currently we handle edit vs read via the `mode` prop.
  return false
})
</script>

<template>
  <AppField
    :field="field.name"
    :label="label"
    :type="type"
    :mode="mode"
    :context="context"
    :size="size"
    :model-value="field.state.value"
    :value="field.state.value"
    :error="error"
    :editor-attrs="editorAttrs"
    :readonly="isReadonly"
    @update:model-value="(val) => field.handleChange(val)"
    @blur="field.handleBlur"
  />
</template>
