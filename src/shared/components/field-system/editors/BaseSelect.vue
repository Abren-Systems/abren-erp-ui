<script setup lang="ts">
/**
 * BaseSelect — Bare, behavior-complete select editor.
 *
 * Headless control-only component for use inside AppField's edit mode.
 * Renders ONLY the interactive <select> element — no label, no .app-field shell.
 *
 * @see docs/FIELD_SYSTEM.md — Phase 2
 */
import { computed, useAttrs } from 'vue'
import { cn } from '@/shared/lib'

defineOptions({ inheritAttrs: false })

interface Option {
  label: string
  value: string | number
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    options?: Option[]
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    error?: string
  }>(),
  {
    modelValue: '',
    options: () => [],
    placeholder: 'Select an option',
    disabled: false,
    readonly: false,
    error: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}>()

const attrs = useAttrs()

const selectClass = computed(() =>
  cn(
    'h-8 w-full rounded-[var(--radius-sm)] border bg-white px-3 text-[var(--text-body)] text-[var(--color-neutral-900)] shadow-sm outline-none transition-colors',
    props.error
      ? 'border-[var(--color-danger-500)]'
      : 'border-[var(--color-neutral-300)] focus:border-[var(--color-primary-600)] focus:ring-2 focus:ring-[var(--color-primary-100)]',
    props.disabled ? 'bg-[var(--color-neutral-50)] opacity-70 cursor-not-allowed' : '',
    props.readonly ? 'bg-[var(--color-neutral-50)] pointer-events-none' : '',
    attrs.class,
  ),
)

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <select
    v-bind="attrs"
    :value="modelValue"
    :disabled="disabled"
    :aria-invalid="error ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-readonly="readonly ? 'true' : undefined"
    :class="selectClass"
    @change="handleChange"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
  >
    <option value="" disabled>{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">
      {{ opt.label }}
    </option>
  </select>
</template>
