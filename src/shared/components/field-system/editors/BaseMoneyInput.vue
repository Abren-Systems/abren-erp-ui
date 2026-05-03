<script setup lang="ts">
/**
 * BaseMoneyInput — Bare, specialized editor for monetary values.
 *
 * Headless control-only component for use inside AppField's edit mode.
 * Renders ONLY the interactive <input> element — no label, no .app-field shell.
 *
 * Responsibilities:
 * - Displays a formatted string (e.g. 1,000.00) when not focused.
 * - Strips formatting on focus for easy native editing.
 * - Enforces numeric input.
 * - Emits a clean primitive `number` to respect the Normalization Boundary.
 *
 * @see docs/FIELD_SYSTEM.md — Phase 2.5
 */
import { ref, computed, watch, useAttrs } from 'vue'
import { cn } from '@/shared/lib'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: number | string | null
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    error?: string
  }>(),
  {
    modelValue: null,
    placeholder: '0.00',
    disabled: false,
    readonly: false,
    error: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}>()

const attrs = useAttrs()
const isFocused = ref(false)
const displayValue = ref('')

const inputClass = computed(() =>
  cn(
    'flex h-8 w-full items-center rounded-[var(--radius-sm)] border bg-white px-3 text-[var(--text-body)] text-[var(--color-neutral-900)] shadow-sm outline-none transition-colors placeholder:text-[var(--color-neutral-400)] tabular-nums text-right',
    props.error
      ? 'border-[var(--color-danger-500)]'
      : 'border-[var(--color-neutral-300)] focus:border-[var(--color-primary-600)] focus:ring-2 focus:ring-[var(--color-primary-100)]',
    props.disabled ? 'bg-[var(--color-neutral-50)] opacity-70 cursor-not-allowed' : '',
    props.readonly ? 'bg-[var(--color-neutral-50)]' : '',
    attrs.class,
  ),
)

// Helper: Format number to string
function formatNumber(val: number | null): string {
  if (val === null || val === undefined || Number.isNaN(val)) return ''
  return new Intl.NumberFormat('en-ET', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)
}

// Helper: Parse string to number
function parseString(val: string): number | null {
  const cleaned = val.replace(/,/g, '').trim()
  if (cleaned === '') return null
  const parsed = Number(cleaned)
  return Number.isNaN(parsed) ? null : parsed
}

// Sync from modelValue to displayValue (only when not focused)
watch(
  () => props.modelValue,
  (newVal) => {
    if (!isFocused.value) {
      const num = typeof newVal === 'string' ? parseString(newVal) : newVal
      displayValue.value = formatNumber(num ?? null)
    }
  },
  { immediate: true },
)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  // Keep the raw string while typing
  displayValue.value = target.value

  // We can emit as the user types so the form state is updated.
  // We emit the parsed number.
  const parsed = parseString(target.value)
  emit('update:modelValue', parsed)
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true
  // Strip formatting for editing
  const num =
    typeof props.modelValue === 'string' ? parseString(props.modelValue) : props.modelValue
  displayValue.value = num === null || num === undefined || Number.isNaN(num) ? '' : String(num)
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false
  // Format the input for display
  const parsed = parseString(displayValue.value)
  displayValue.value = formatNumber(parsed)
  // Ensure the emitted value is perfectly in sync on blur
  emit('update:modelValue', parsed)
  emit('blur', event)
}
</script>

<template>
  <input
    v-bind="attrs"
    :value="displayValue"
    type="text"
    inputmode="decimal"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :aria-invalid="error ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-readonly="readonly ? 'true' : undefined"
    :class="inputClass"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>
