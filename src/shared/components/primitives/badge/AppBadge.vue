<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/shared/utils'

defineOptions({ inheritAttrs: false })

interface Props {
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
  circular?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  circular: false,
})

const attrs = useAttrs()

const badgeClass = computed(() =>
  cn(
    'inline-flex items-center justify-center border text-[10px] font-bold uppercase tracking-tight',
    props.circular
      ? 'min-h-[16px] min-w-[16px] rounded-sm px-1'
      : 'min-h-[16px] rounded-[var(--radius-sm)] px-1.5',
    variantClasses[props.variant],
    attrs.class,
  ),
)

const variantClasses = {
  neutral:
    'border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]',
  primary:
    'border-[var(--color-primary-100)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]',
  success:
    'border-[var(--color-success-100)] bg-[var(--color-success-50)] text-[var(--color-success-700)]',
  warning:
    'border-[var(--color-warning-100)] bg-[var(--color-warning-50)] text-[var(--color-warning-700)]',
  danger:
    'border-[var(--color-danger-100)] bg-[var(--color-danger-50)] text-[var(--color-danger-700)]',
  info: 'border-[var(--color-info-100)] bg-[var(--color-info-50)] text-[var(--color-info-700)]',
} as const
</script>

<template>
  <span :class="badgeClass">
    <slot />
  </span>
</template>
