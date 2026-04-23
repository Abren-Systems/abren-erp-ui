<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/shared/lib'

defineOptions({ inheritAttrs: false })

interface Props {
  variant?: 'primary' | 'secondary' | 'stealth' | 'outline' | 'neutral' | 'danger'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  type: 'button',
  disabled: false,
  loading: false,
  size: 'md',
})

defineEmits(['click'])

const attrs = useAttrs()

const buttonClass = computed(() =>
  cn(
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] border font-semibold select-none transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] focus-visible:ring-offset-2 ring-offset-white',
    sizeClasses[props.size],
    variantClasses[props.variant],
    attrs.class,
  ),
)

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const sizeClasses = {
  sm: 'h-7 px-2.5 text-[12px]',
  md: 'h-8 px-3 text-[13px]',
  lg: 'h-10 px-4 text-[14px]',
} as const

const variantClasses = {
  primary:
    'border-[var(--color-primary-700)] bg-[var(--color-primary-600)] text-white shadow-[0_8px_18px_rgba(79,70,229,0.18)] hover:bg-[var(--color-primary-700)]',
  secondary:
    'border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)] hover:bg-[var(--color-neutral-200)]',
  stealth:
    'border-transparent bg-transparent text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)]',
  outline:
    'border-[var(--color-neutral-300)] bg-white text-[var(--color-neutral-800)] hover:bg-[var(--color-neutral-50)]',
  neutral:
    'border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-800)] hover:bg-[var(--color-neutral-50)]',
  danger:
    'border-[var(--color-danger-700)] bg-[var(--color-danger-600)] text-white hover:bg-[var(--color-danger-700)]',
} as const
</script>

<template>
  <button
    v-bind="forwardedAttrs"
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClass"
    @click="$emit('click', $event)"
  >
    <span
      v-if="loading"
      class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
      aria-hidden="true"
    />
    <slot v-else-if="$slots.start" name="start" />
    <slot />
    <slot v-if="$slots.end" name="end" />
  </button>
</template>
