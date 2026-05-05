<script setup lang="ts">
/**
 * BaseTextarea — Bare, behavior-complete textarea editor.
 *
 * Headless control-only component for use inside AppField's edit mode.
 * Renders ONLY the interactive <textarea> element — no label, no .app-field shell.
 *
 * @see docs/FIELD_SYSTEM.md — Phase 2
 */
import { computed, useAttrs } from 'vue'
import { cn } from '@/shared/utils'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    rows?: number
    disabled?: boolean
    readonly?: boolean
    error?: string
  }>(),
  {
    modelValue: '',
    placeholder: '',
    rows: 3,
    disabled: false,
    readonly: false,
    error: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}>()

const attrs = useAttrs()

const textareaClass = computed(() =>
  cn(
    'min-h-24 w-full rounded-[var(--radius-sm)] border bg-white px-3 py-2 text-[var(--text-body)] leading-6 text-[var(--color-neutral-900)] shadow-sm outline-none transition-colors placeholder:text-[var(--color-neutral-400)]',
    props.error
      ? 'border-[var(--color-danger-500)]'
      : 'border-[var(--color-neutral-300)] focus:border-[var(--color-primary-600)] focus:ring-2 focus:ring-[var(--color-primary-100)]',
    props.disabled ? 'bg-[var(--color-neutral-50)] opacity-70 cursor-not-allowed' : '',
    props.readonly ? 'bg-[var(--color-neutral-50)]' : '',
    attrs.class,
  ),
)

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <textarea
    v-bind="attrs"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    :readonly="readonly"
    :aria-invalid="error ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-readonly="readonly ? 'true' : undefined"
    :class="textareaClass"
    @input="handleInput"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
  />
</template>
