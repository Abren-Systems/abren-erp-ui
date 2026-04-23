<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/shared/lib'

defineOptions({ inheritAttrs: false })

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  rows?: number
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false,
  error: '',
  rows: 3,
  description: '',
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])
const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const textareaClass = computed(() =>
  cn(
    'min-h-24 w-full rounded-[var(--radius-sm)] border bg-white px-3 py-2 text-[13px] leading-6 text-[var(--color-neutral-900)] shadow-sm outline-none transition-colors placeholder:text-[var(--color-neutral-400)]',
    props.error
      ? 'border-[var(--color-danger-500)]'
      : 'border-[var(--color-neutral-300)] focus:border-[var(--color-primary-600)] focus:ring-2 focus:ring-[var(--color-primary-100)]',
    props.disabled ? 'bg-[var(--color-neutral-50)] opacity-70' : '',
    attrs.class,
  ),
)

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
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

    <textarea
      v-bind="forwardedAttrs"
      :id="typeof forwardedAttrs.id === 'string' ? forwardedAttrs.id : undefined"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :rows="rows"
      :class="textareaClass"
      @input="handleInput"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />

    <p v-if="description" class="text-[11px] text-[var(--color-neutral-500)]">
      {{ description }}
    </p>

    <span v-if="error" class="text-[11px] font-medium text-[var(--color-danger-600)]">
      {{ error }}
    </span>
  </div>
</template>
