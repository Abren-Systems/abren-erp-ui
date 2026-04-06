<script setup lang="ts">
/**
 * Design System Button component.
 *
 * Implements the standard action style for the Abren ERP.
 * Built on Radix UI's Primitive for maximum accessibility.
 *
 * @example
 * <Button variant="primary" size="lg" @click="doSomething">
 *   Submit Request
 * </Button>
 */
import type { HTMLAttributes } from 'vue'
import { Primitive, type PrimitiveProps } from 'radix-vue'
import { cn } from '@/shared/lib'
import { type ButtonVariants, buttonVariants } from './index'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
})
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
