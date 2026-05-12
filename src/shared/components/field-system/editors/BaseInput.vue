<script setup lang="ts">
/**
 * BaseInput — Bare, behavior-complete input editor.
 *
 * This is a headless control-only component for use inside AppField's edit mode.
 * It renders ONLY the interactive <input> element — no label, no .app-field shell.
 *
 * Responsibilities: v-model, keyboard, focus/blur, aria, disabled/readonly, styling.
 * Forbidden: label, layout, domain formatting, validation logic, error display.
 *
 * @see docs/FIELD_SYSTEM.md — Phase 2
 */
import { computed, useAttrs } from 'vue'
import { cn } from '@/shared/utils'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    type?: string
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    error?: string
    inputmode?: string
  }>(),
  {
    modelValue: '',
    type: 'text',
    placeholder: '',
    disabled: false,
    readonly: false,
    error: '',
    inputmode: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}>()

const attrs = useAttrs()

const inputClass = computed(() =>
  cn(
    'flex h-8 w-full items-center rounded-[var(--radius-sm)] border bg-[var(--app-focus)] px-3 text-[var(--text-body)] text-[var(--color-neutral-900)] shadow-sm outline-none transition-colors placeholder:text-[var(--color-neutral-400)]',
    props.error
      ? 'border-[var(--color-danger-500)]'
      : 'border-[var(--color-neutral-300)] focus:border-[var(--color-primary-600)] focus:ring-2 focus:ring-[var(--color-primary-100)]',
    props.disabled ? 'bg-[var(--color-neutral-50)] opacity-70 cursor-not-allowed' : '',
    props.readonly ? 'bg-[var(--color-neutral-50)]' : '',
    attrs.class,
  ),
)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const raw = target.value

  // Primitive normalization: strip commas from numeric input
  if (props.type === 'number' || props.inputmode === 'decimal' || props.inputmode === 'numeric') {
    const cleaned = raw.replace(/,/g, '')
    emit('update:modelValue', cleaned === '' ? '' : Number(cleaned))
    return
  }

  // String cleanup: trim leading/trailing whitespace on emission
  emit('update:modelValue', raw)
}
</script>

<template>
  <input
    v-bind="attrs"
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :inputmode="inputmode"
    :aria-invalid="error ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-readonly="readonly ? 'true' : undefined"
    :class="inputClass"
    @input="handleInput"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
  />
</template>
