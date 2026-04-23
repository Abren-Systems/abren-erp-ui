<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/shared/lib'

defineOptions({ inheritAttrs: false })

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  error: '',
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])
const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const controlClass = computed(() =>
  cn(
    'flex h-8 w-full items-center gap-2 rounded-[var(--radius-sm)] border bg-white px-3 shadow-sm transition-colors',
    props.error
      ? 'border-[var(--color-danger-500)]'
      : 'border-[var(--color-neutral-300)] focus-within:border-[var(--color-primary-600)] focus-within:ring-2 focus-within:ring-[var(--color-primary-100)]',
    props.disabled ? 'bg-[var(--color-neutral-50)] opacity-70' : '',
    attrs.class,
  ),
)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="flex w-full flex-col gap-1.5">
    <label
      v-if="label"
      :for="typeof forwardedAttrs.id === 'string' ? forwardedAttrs.id : undefined"
      class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-neutral-500)]"
    >
      {{ label }}
      <span v-if="required" class="ml-0.5 text-[var(--color-danger-600)]">*</span>
    </label>

    <div :class="controlClass">
      <span v-if="$slots.start" class="flex shrink-0 items-center text-[var(--color-neutral-400)]">
        <slot name="start" />
      </span>

      <input
        v-bind="forwardedAttrs"
        :id="typeof forwardedAttrs.id === 'string' ? forwardedAttrs.id : undefined"
        :value="modelValue"
        :placeholder="placeholder"
        :type="type"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        class="h-full min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[var(--color-neutral-900)] outline-none placeholder:text-[var(--color-neutral-400)]"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />

      <span v-if="$slots.end" class="flex shrink-0 items-center text-[var(--color-neutral-400)]">
        <slot name="end" />
      </span>
    </div>

    <span v-if="error" class="text-[11px] font-medium text-[var(--color-danger-600)]">
      {{ error }}
    </span>
  </div>
</template>
