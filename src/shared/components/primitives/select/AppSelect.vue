<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/shared/lib'

defineOptions({ inheritAttrs: false })

interface Option {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  modelValue?: string | number | null
  label?: string
  options?: Option[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  options: () => [],
  placeholder: 'Select an option',
  disabled: false,
  required: false,
  error: '',
})

const emit = defineEmits(['update:modelValue', 'change'])
const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const controlClass = computed(() =>
  cn(
    'h-8 w-full rounded-[var(--radius-sm)] border bg-white px-3 text-[13px] text-[var(--color-neutral-900)] shadow-sm outline-none transition-colors',
    props.error
      ? 'border-[var(--color-danger-500)]'
      : 'border-[var(--color-neutral-300)] focus:border-[var(--color-primary-600)] focus:ring-2 focus:ring-[var(--color-primary-100)]',
    props.disabled ? 'bg-[var(--color-neutral-50)] opacity-70' : '',
    attrs.class,
  ),
)

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
  emit('change', target.value)
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

    <select
      v-bind="forwardedAttrs"
      :id="typeof forwardedAttrs.id === 'string' ? forwardedAttrs.id : undefined"
      :value="modelValue ?? ''"
      :disabled="disabled"
      :required="required"
      :class="controlClass"
      @change="handleChange"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option
        v-for="opt in options"
        :key="String(opt.value)"
        :value="String(opt.value)"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </option>
      <slot />
    </select>

    <span v-if="error" class="text-[11px] font-medium text-[var(--color-danger-600)]">
      {{ error }}
    </span>
  </div>
</template>
